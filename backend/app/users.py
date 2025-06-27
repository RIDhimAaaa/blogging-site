from flask import Blueprint, request, jsonify
from .models import User, Blog, Like, BlogView, Follow, db
from sqlalchemy import func

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/<username>', methods=['GET'])
def get_user_profile(username):
    """Get user profile and their public blogs"""
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
      # Pagination for user's blogs
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    per_page = min(per_page, 50)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    # Get user's published blogs with counts
    blogs_query = Blog.query.filter(
        Blog.user_id == user.id,
        Blog.is_draft == False,
        Blog.is_archived == False
    ).order_by(Blog.timestamp.desc())
    
    paginated_blogs = blogs_query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    # Serialize blogs with counts
    blogs_list = []
    for blog in paginated_blogs.items:
        likes_count = Like.query.filter_by(blog_id=blog.id).count()
        views_count = BlogView.query.filter_by(blog_id=blog.id).count()
        
        blogs_list.append({
            'id': blog.id,
            'title': blog.title,
            'content': blog.content[:200] + '...' if len(blog.content) > 200 else blog.content,
            'timestamp': blog.timestamp.isoformat(),
            'category': blog.category,
            'tags': [tag.name for tag in blog.tags],
            'likes_count': likes_count,
            'views_count': views_count
        })
      # User stats
    total_blogs = Blog.query.filter_by(user_id=user.id, is_draft=False, is_archived=False).count()
    total_likes = db.session.query(func.count(Like.id)).join(Blog).filter(Blog.user_id == user.id).scalar() or 0
    total_views = db.session.query(func.count(BlogView.id)).join(Blog).filter(Blog.user_id == user.id).scalar() or 0
    
    # Follow stats
    followers_count = Follow.query.filter_by(followed_id=user.id).count()
    following_count = Follow.query.filter_by(follower_id=user.id).count()
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'joined_date': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
            'is_verified': user.is_verified
        },
        'stats': {
            'total_blogs': total_blogs,
            'total_likes_received': total_likes,
            'total_views_received': total_views,
            'followers_count': followers_count,
            'following_count': following_count
        },
        'blogs': blogs_list,        'pagination': {
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

@users_bp.route('', methods=['GET'])
def get_all_users():
    """Get list of all users for discovery"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    search = request.args.get('search', '')
    
    # Query users with search functionality
    query = User.query.filter(User.is_verified == True)
    if search:
        query = query.filter(User.username.ilike(f'%{search}%'))
    
    paginated_users = query.order_by(User.username).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    users_list = []
    for user in paginated_users.items:
        # Get user stats
        blog_count = Blog.query.filter_by(user_id=user.id, is_draft=False, is_archived=False).count()
        
        users_list.append({
            'id': user.id,
            'username': user.username,
            'joined_date': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
            'blog_count': blog_count
        })
    
    return jsonify({
        'users': users_list,
        'pagination': {
            'page': paginated_users.page,
            'per_page': paginated_users.per_page,
            'total': paginated_users.total,
            'pages': paginated_users.pages,
            'has_next': paginated_users.has_next,
            'has_prev': paginated_users.has_prev,
            'next_num': paginated_users.next_num if paginated_users.has_next else None,
            'prev_num': paginated_users.prev_num if paginated_users.has_prev else None
        }
    }), 200