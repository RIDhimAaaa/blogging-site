from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Blog, User, Tag, db
from sqlalchemy import func

blogs_bp = Blueprint('blogs', __name__, url_prefix='/api/blogs')

# Predefined categories for better organization and searchability
BLOG_CATEGORIES = [
    'technology',
    'programming',
    'web-development',
    'mobile-development',
    'data-science',
    'artificial-intelligence',
    'machine-learning',
    'cybersecurity',
    'cloud-computing',
    'devops',
    'design',
    'ui-ux',
    'business',
    'entrepreneurship',
    'finance',
    'marketing',
    'productivity',
    'career',
    'education',
    'tutorials',
    'reviews',
    'news',
    'opinion',
    'lifestyle',
    'health',
    'travel',
    'food',
    'entertainment',
    'sports',
    'science',
    'others'
]

def validate_category(category):
    """Validate if category is in the allowed list"""
    if not category:
        return True  # Category is optional
    return category.lower() in BLOG_CATEGORIES

@blogs_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get list of available blog categories"""
    return jsonify({
        'categories': BLOG_CATEGORIES,
        'total': len(BLOG_CATEGORIES)
    }), 200

@blogs_bp.route('', methods=['POST'])
@jwt_required()
def create_blog():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    title = data.get('title')
    content = data.get('content')
    category = data.get('category')
    tags_input = data.get('tags', [])
    publish_flag = data.get('publish', False)

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    # Validate category
    if category and not validate_category(category):
        return jsonify({
            'error': f'Invalid category. Must be one of: {", ".join(BLOG_CATEGORIES)}'
        }), 400

    # Normalize category to lowercase for consistency
    if category:
        category = category.lower()

    tags = []
    for tag_name in tags_input:
        tag_name = tag_name.lower()
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        tags.append(tag)

    new_blog = Blog(title=title, content=content, user_id=user_id, category=category, tags=tags, is_draft=not publish_flag)
    db.session.add(new_blog)
    db.session.commit()

    return jsonify({
        'msg': 'Blog created successfully',
        'blog': {
            'id': new_blog.id,
            'title': new_blog.title,
            'content': new_blog.content,
            'timestamp': new_blog.timestamp.isoformat(),
            'category': new_blog.category,
            'is_draft': new_blog.is_draft
        }
    }), 201

@blogs_bp.route('', methods=['GET'])
def get_blogs():
    # Pagination parameters with validation
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    category = request.args.get('category')
    query = Blog.query.filter_by(is_draft=False, is_archived=False)
    if category:
        query = query.filter_by(category=category)

    # Apply pagination
    paginated_blogs = query.order_by(Blog.timestamp.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    result = [{
        'id': blog.id,
        'title': blog.title,
        'content': blog.content,
        'timestamp': blog.timestamp.isoformat(),
        'category': blog.category,
        'author': blog.user.username
    } for blog in paginated_blogs.items]

    # Return paginated response
    return jsonify({
        'blogs': result,
        'pagination': {
            'page': paginated_blogs.page,
            'per_page': paginated_blogs.per_page,
            'total': paginated_blogs.total,
            'pages': paginated_blogs.pages,
            'has_next': paginated_blogs.has_next,
            'has_prev': paginated_blogs.has_prev,
            'next_num': paginated_blogs.next_num if paginated_blogs.has_next else None,
            'prev_num': paginated_blogs.prev_num if paginated_blogs.has_prev else None
        }
    }), 200


@blogs_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_blog_by_id(id):
    blog = Blog.query.get(id)
    if not blog:
        return jsonify({'msg': 'Blog not found'}), 404
    
    # Track view (with 1-hour cooldown to prevent spam)
    user_id = int(get_jwt_identity())
    from .models import BlogView, Like
    from datetime import datetime, timedelta
    
    # Check if user already viewed this blog recently
    recent_view = BlogView.query.filter_by(
        blog_id=id, 
        user_id=user_id
    ).filter(
        BlogView.timestamp > datetime.utcnow() - timedelta(hours=1)
    ).first()
    
    # Only create new view if no recent view exists
    if not recent_view:
        view = BlogView(blog_id=id, user_id=user_id, ip_address=request.remote_addr)
        db.session.add(view)
        db.session.commit()
    
    # Get counts (consistent with your trending blogs approach)
    view_count = BlogView.query.filter_by(blog_id=id).count()
    likes_count = Like.query.filter_by(blog_id=id).count()
    
    # Return consistent response format (matching your other endpoints)
    return jsonify({
        'id': blog.id,
        'title': blog.title,
        'content': blog.content,
        'timestamp': blog.timestamp.isoformat(),
        'category': blog.category,
        'author': blog.user.username,
        'tags': [tag.name for tag in blog.tags],  # Consistent with search/trending
        'view_count': view_count,
        'likes_count': likes_count
    }), 200



@blogs_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_blog(id):
    blog = Blog.query.get(id)
    user_id = int(get_jwt_identity())
    
    if not blog:
        return jsonify({'msg': 'Blog not found'}), 404

    if blog.user_id != user_id:
        return jsonify({'msg': 'Unauthorized'}), 403

    data = request.get_json()
    
    # Validate category if provided
    new_category = data.get('category', blog.category)
    if new_category and not validate_category(new_category):
        return jsonify({
            'error': f'Invalid category. Must be one of: {", ".join(BLOG_CATEGORIES)}'
        }), 400

    blog.title = data.get('title', blog.title)
    blog.content = data.get('content', blog.content)
    blog.category = new_category.lower() if new_category else blog.category
    
    # Handle publish status change
    if 'publish' in data:
        blog.is_draft = not data.get('publish', blog.is_draft)

    blog.tags.clear()
    tags_input = data.get('tags', [])

    for tag_name in tags_input:
        tag_name = tag_name.lower()
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        blog.tags.append(tag)

    db.session.commit()

    return jsonify({'msg': 'Blog updated successfully'}), 200

@blogs_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_blog(id):
    blog = Blog.query.get(id)
    user_id = int(get_jwt_identity())
    if not blog:
        return jsonify({'msg': 'Blog not found'}), 404

    if blog.user_id != user_id:
        return jsonify({'msg': 'Unauthorized'}), 403

    db.session.delete(blog)
    db.session.commit()

    return jsonify({'msg': 'Blog deleted successfully'}), 200

@blogs_bp.route('/search', methods=['GET'])
def search_blogs():
    # Pagination parameters with validation
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    per_page = min(per_page, 100)
    
    # Search parameters
    username = request.args.get('username')
    title = request.args.get('title')
    category = request.args.get('category')
    tag_filter = request.args.get('tags')
    author_only = request.args.get('author_only', 'false').lower() == 'true'

    # If searching for authors only
    if author_only and username:
        # Return unique authors matching search, not their blogs
        authors_query = db.session.query(User).join(Blog).filter(
            User.username.ilike(f'%{username}%'),
            Blog.is_draft == False,
            Blog.is_archived == False
        ).distinct()
        
        # Apply pagination to authors
        paginated_authors = authors_query.order_by(User.username).paginate(
            page=page,
            per_page=min(per_page, 50),  # Limit author results
            error_out=False
        )
        
        authors_list = []
        for author in paginated_authors.items:
            blog_count = Blog.query.filter_by(user_id=author.id, is_draft=False, is_archived=False).count()
            authors_list.append({
                'id': author.id,
                'username': author.username,
                'blog_count': blog_count,
                'joined_date': author.created_at.isoformat() if hasattr(author, 'created_at') else None,
                'profile_url': f'/api/users/{author.username}'  # Helper for frontend
            })
        
        return jsonify({
            'authors': authors_list,
            'pagination': {
                'page': paginated_authors.page,
                'per_page': paginated_authors.per_page,
                'total': paginated_authors.total,
                'pages': paginated_authors.pages,
                'has_next': paginated_authors.has_next,
                'has_prev': paginated_authors.has_prev,
                'next_num': paginated_authors.next_num if paginated_authors.has_next else None,
                'prev_num': paginated_authors.prev_num if paginated_authors.has_prev else None
            },
            'search_type': 'authors_only',
            'search_term': username
        }), 200

    # Regular blog search
    query = Blog.query.join(User)

    if username:
        query = query.filter(User.username.ilike(f'%{username}%'))

    if title:
        query = query.filter(Blog.title.ilike(f'%{title}%'))

    if category:
        query = query.filter(Blog.category.ilike(f'%{category}%'))

    if tag_filter:
        tag_names = [t.strip().lower() for t in tag_filter.split(',')]
        query = query.join(Blog.tags).filter(Tag.name.in_(tag_names)).distinct()

    query = query.filter(Blog.is_draft == False, Blog.is_archived == False)

    # Apply pagination
    paginated_results = query.order_by(Blog.timestamp.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    response = []
    for blog in paginated_results.items:
        response.append({
            'id': blog.id,
            'title': blog.title,
            'content': blog.content,
            'category': blog.category,
            'timestamp': blog.timestamp.isoformat(),
            'author': blog.user.username,
            'tags': [tag.name for tag in blog.tags]
        })

    return jsonify({
        'blogs': response,
        'pagination': {
            'page': paginated_results.page,
            'per_page': paginated_results.per_page,
            'total': paginated_results.total,
            'pages': paginated_results.pages,
            'has_next': paginated_results.has_next,
            'has_prev': paginated_results.has_prev,
            'next_num': paginated_results.next_num if paginated_results.has_next else None,
            'prev_num': paginated_results.prev_num if paginated_results.has_prev else None
        }
    }), 200

@blogs_bp.route('/<int:blog_id>/publish', methods=['PATCH'])
@jwt_required()
def publish_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    user_id = int(get_jwt_identity())
    if blog.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    blog.is_draft = False
    db.session.commit()
    return jsonify({'message': 'Blog published'}), 200

@blogs_bp.route('/<int:blog_id>/archive', methods=['PATCH'])
@jwt_required()
def archive_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    user_id = int(get_jwt_identity())
    if blog.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    blog.is_archived = True
    db.session.commit()
    return jsonify({'message': 'Blog archived'}), 200

@blogs_bp.route('/drafts', methods=['GET'])
@jwt_required()
def get_drafts():
    user_id = int(get_jwt_identity())
    
    # Pagination parameters with validation
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    per_page = min(per_page, 100)
    
    # Apply pagination to drafts query
    paginated_drafts = Blog.query.filter_by(user_id=user_id, is_draft=True).order_by(Blog.timestamp.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    drafts_list = [
        {
            'id': blog.id,
            'title': blog.title,
            'content': blog.content,
            'timestamp': blog.timestamp.isoformat(),
            'category': blog.category,
            'tags': [tag.name for tag in blog.tags]
        }
        for blog in paginated_drafts.items
    ]
    
    return jsonify({
        'blogs': drafts_list,  # Changed from 'drafts' to 'blogs' for consistency
        'pagination': {
            'page': paginated_drafts.page,
            'per_page': paginated_drafts.per_page,
            'total': paginated_drafts.total,
            'pages': paginated_drafts.pages,
            'has_next': paginated_drafts.has_next,
            'has_prev': paginated_drafts.has_prev,
            'next_num': paginated_drafts.next_num if paginated_drafts.has_next else None,
            'prev_num': paginated_drafts.prev_num if paginated_drafts.has_prev else None
        }
    }), 200

@blogs_bp.route('/archived', methods=['GET'])
@jwt_required()
def get_archived_blogs():
    user_id = int(get_jwt_identity())
    
    # Pagination parameters with validation
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    per_page = min(per_page, 100)
    
    # Apply pagination to archived blogs query
    paginated_archived = Blog.query.filter_by(user_id=user_id, is_archived=True).order_by(Blog.timestamp.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    archived_list = [
        {
            'id': blog.id,
            'title': blog.title,
            'content': blog.content,
            'timestamp': blog.timestamp.isoformat(),
            'category': blog.category,
            'tags': [tag.name for tag in blog.tags]
        }
        for blog in paginated_archived.items
    ]
    
    return jsonify({
        'blogs': archived_list,  # Changed from 'archived_blogs' to 'blogs' for consistency
        'pagination': {
            'page': paginated_archived.page,
            'per_page': paginated_archived.per_page,
            'total': paginated_archived.total,
            'pages': paginated_archived.pages,
            'has_next': paginated_archived.has_next,
            'has_prev': paginated_archived.has_prev,
            'next_num': paginated_archived.next_num if paginated_archived.has_next else None,
            'prev_num': paginated_archived.prev_num if paginated_archived.has_prev else None
        }
    }), 200

@blogs_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_personalized_recommendations():
    """Get personalized blog recommendations based on user's category preferences"""
    user_id = int(get_jwt_identity())
    
    # Import here to avoid circular imports
    from .models import UserCategoryPreference
    
    # Pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    per_page = min(per_page, 50)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    # Get user's preferred categories
    user_preferences = UserCategoryPreference.query.filter_by(user_id=user_id).all()
    preferred_categories = [pref.category for pref in user_preferences]
    
    if not preferred_categories:
        # If no preferences set, return general popular blogs
        return jsonify({
            'message': 'No category preferences set. Please set your preferences first.',
            'recommendations': [],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': 0,
                'pages': 0,
                'has_next': False,
                'has_prev': False
            },
            'suggestion': 'Visit /api/preferences/categories to set your preferred categories'
        }), 200
    
    # Get blogs from preferred categories (excluding user's own blogs)
    query = Blog.query.filter(
        Blog.is_draft == False,
        Blog.is_archived == False,
        Blog.user_id != user_id,  # Exclude user's own blogs
        Blog.category.in_(preferred_categories)
    ).order_by(Blog.timestamp.desc())
    
    # Apply pagination
    paginated_blogs = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    # Serialize blogs
    recommendations = []
    for blog in paginated_blogs.items:
        recommendations.append({
            'id': blog.id,
            'title': blog.title,
            'content': blog.content[:200] + '...' if len(blog.content) > 200 else blog.content,  # Preview
            'timestamp': blog.timestamp.isoformat(),
            'category': blog.category,
            'author': blog.user.username,
            'tags': [tag.name for tag in blog.tags],
            'likes_count': len(blog.likes) if hasattr(blog, 'likes') else 0
        })
    
    return jsonify({
        'recommendations': recommendations,
        'pagination': {
            'page': paginated_blogs.page,
            'per_page': paginated_blogs.per_page,
            'total': paginated_blogs.total,
            'pages': paginated_blogs.pages,
            'has_next': paginated_blogs.has_next,
            'has_prev': paginated_blogs.has_prev,
            'next_num': paginated_blogs.next_num if paginated_blogs.has_next else None,
            'prev_num': paginated_blogs.prev_num if paginated_blogs.has_prev else None
        },
        'based_on_categories': preferred_categories,
        'total_preferred_categories': len(preferred_categories)
    }), 200

@blogs_bp.route('/trending', methods=['GET'])
def get_trending_blogs():
    """Get trending blogs across all categories"""
    # Pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
      # Get blogs with most likes in the last 7 days (simplified trending logic)
    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)

    from .models import Like #import like model at the top 
    
    # For now, just get recent popular blogs (you can enhance this with like counts later)
    query = Blog.query.outerjoin(Like, Blog.id == Like.blog_id).filter(
        Blog.is_draft == False,
        Blog.is_archived == False,
        Blog.timestamp >= week_ago
    ).group_by(Blog.id).order_by(
        func.count(Like.id).desc(),  # ✅ Most liked first
        Blog.timestamp.desc()        # ✅ Then by newest as tiebreaker
    )
    
    paginated_blogs = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    trending_blogs = []
    for blog in paginated_blogs.items:
        likes_count = Like.query.filter_by(blog_id=blog.id).count()
        trending_blogs.append({
            'id': blog.id,
            'title': blog.title,
            'content': blog.content[:200] + '...' if len(blog.content) > 200 else blog.content,
            'timestamp': blog.timestamp.isoformat(),
            'category': blog.category,
            'author': blog.user.username,
            'tags': [tag.name for tag in blog.tags],
            'likes_count': likes_count
        })
    
    return jsonify({
        'trending_blogs': trending_blogs,
        'pagination': {
            'page': paginated_blogs.page,
            'per_page': paginated_blogs.per_page,
            'total': paginated_blogs.total,
            'pages': paginated_blogs.pages,
            'has_next': paginated_blogs.has_next,
            'has_prev': paginated_blogs.has_prev
        },
        'period': 'last_7_days'
    }), 200
