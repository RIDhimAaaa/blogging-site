# app/comments.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, Comment, Blog, User, CommentLike
from datetime import datetime

comments_bp = Blueprint('comments', __name__)


@comments_bp.route('/<int:blog_id>', methods=['POST'])
@jwt_required()
def add_comment(blog_id):
    """Add a comment or reply to a blog post"""
    data = request.get_json()
    user_id = get_jwt_identity()
    content = data.get('content')
    parent_id = data.get('parent_id')  # Optional for replies

    if not content or len(content.strip()) == 0:
        return jsonify({'error': 'Content is required'}), 400
    
    if len(content) > 1000:  # Limit comment length
        return jsonify({'error': 'Comment too long (max 1000 characters)'}), 400

    # Check if the blog exists
    blog = Blog.query.get_or_404(blog_id)

    # If replying to a comment, validate parent exists and is not a reply itself
    if parent_id:
        parent_comment = Comment.query.get_or_404(parent_id)
        # Ensure parent belongs to the same blog
        if parent_comment.blog_id != blog_id:
            return jsonify({'error': 'Invalid parent comment'}), 400
        # YouTube/Instagram style: Only allow 1 level of nesting (no replies to replies)
        if parent_comment.parent_id is not None:
            return jsonify({'error': 'Cannot reply to a reply. Please reply to the original comment.'}), 400

    comment = Comment(
        content=content.strip(),
        user_id=user_id,
        blog_id=blog_id,
        parent_id=parent_id
    )
    db.session.add(comment)
    db.session.commit()

    # Return the created comment with user info
    return jsonify({
        'message': 'Comment added successfully',
        'comment': {
            'id': comment.id,
            'content': comment.content,
            'timestamp': comment.timestamp.isoformat(),
            'user': comment.user.username,
            'parent_id': comment.parent_id,
            'likes': 0,
            'is_reply': parent_id is not None
        }
    }), 201

@comments_bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment (by author or blog owner)"""
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)
    blog = Blog.query.get(comment.blog_id)

    # Blog owner or comment author can delete
    if int(comment.user_id) != int(user_id) and int(blog.user_id) != int(user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    # If deleting a parent comment, also delete all replies
    if comment.parent_id is None:
        replies_count = Comment.query.filter_by(parent_id=comment.id).count()
        Comment.query.filter_by(parent_id=comment.id).delete()
        message = f'Comment and {replies_count} replies deleted'
    else:
        message = 'Reply deleted'

    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({'message': message}), 200


@comments_bp.route('/blog/<int:blog_id>', methods=['GET'])
def get_comments(blog_id):
    """Get comments for a blog with pagination and proper nesting"""
    blog = Blog.query.get_or_404(blog_id)
    
    # Pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)  # Limit to prevent abuse
    
    # Get only parent comments (not replies) with pagination
    paginated_comments = Comment.query.filter_by(
        blog_id=blog.id, 
        parent_id=None
    ).order_by(Comment.timestamp.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    def serialize_comment(comment, current_user_id=None):
        """Serialize comment with all necessary info"""
        # Get replies (limited to prevent overload)
        replies = Comment.query.filter_by(parent_id=comment.id)\
                              .order_by(Comment.timestamp.asc())\
                              .limit(10).all()  # Show first 10 replies
        
        total_replies = Comment.query.filter_by(parent_id=comment.id).count()
        
        return {
            'id': comment.id,
            'content': comment.content,
            'user': {
                'id': comment.user.id,
                'username': comment.user.username
            },
            'timestamp': comment.timestamp.isoformat(),
            'likes': comment.like_count,
            'is_liked': _is_comment_liked(comment.id, current_user_id) if current_user_id else False,
            'replies_count': total_replies,
            'replies': [serialize_reply(reply, current_user_id) for reply in replies],
            'has_more_replies': total_replies > 10
        }

    def serialize_reply(reply, current_user_id=None):
        """Serialize reply comment"""
        return {
            'id': reply.id,
            'content': reply.content,
            'user': {
                'id': reply.user.id,
                'username': reply.user.username
            },
            'timestamp': reply.timestamp.isoformat(),
            'likes': reply.like_count,
            'is_liked': _is_comment_liked(reply.id, current_user_id) if current_user_id else False,
            'parent_id': reply.parent_id
        }

    # Check if user is authenticated to show like status
    current_user_id = None
    try:
        current_user_id = get_jwt_identity()
    except:
        pass  # User not authenticated

    comments_data = [serialize_comment(comment, current_user_id) 
                    for comment in paginated_comments.items]

    return jsonify({
        'comments': comments_data,
        'pagination': {
            'page': paginated_comments.page,
            'per_page': paginated_comments.per_page,
            'total': paginated_comments.total,
            'pages': paginated_comments.pages,
            'has_next': paginated_comments.has_next,
            'has_prev': paginated_comments.has_prev
        }
    }), 200

@comments_bp.route('/<int:comment_id>/like', methods=['POST'])
@jwt_required()
def like_comment(comment_id):
    """Like or unlike a comment"""
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)
    
    # Check if already liked
    existing_like = CommentLike.query.filter_by(
        user_id=user_id, 
        comment_id=comment_id
    ).first()
    
    if existing_like:
        # Unlike the comment
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({
            'message': 'Comment unliked',
            'liked': False,
            'likes_count': comment.like_count
        }), 200
    else:
        # Like the comment
        like = CommentLike(
            user_id=user_id,
            comment_id=comment_id,
            blog_id=comment.blog_id
        )
        db.session.add(like)
        db.session.commit()
        return jsonify({
            'message': 'Comment liked',
            'liked': True,
            'likes_count': comment.like_count
        }), 200

@comments_bp.route('/<int:comment_id>/replies', methods=['GET'])
def get_comment_replies(comment_id):
    """Get more replies for a specific comment (load more functionality)"""
    comment = Comment.query.get_or_404(comment_id)
    
    # Pagination for replies
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    per_page = min(per_page, 20)
    
    paginated_replies = Comment.query.filter_by(parent_id=comment_id)\
                                   .order_by(Comment.timestamp.asc())\
                                   .paginate(
                                       page=page,
                                       per_page=per_page,
                                       error_out=False
                                   )
    
    # Check if user is authenticated
    current_user_id = None
    try:
        current_user_id = get_jwt_identity()
    except:
        pass
    
    def serialize_reply(reply):
        return {
            'id': reply.id,
            'content': reply.content,
            'user': {
                'id': reply.user.id,
                'username': reply.user.username
            },
            'timestamp': reply.timestamp.isoformat(),
            'likes': reply.like_count,
            'is_liked': _is_comment_liked(reply.id, current_user_id) if current_user_id else False,
            'parent_id': reply.parent_id
        }
    
    replies_data = [serialize_reply(reply) for reply in paginated_replies.items]
    
    return jsonify({
        'replies': replies_data,
        'pagination': {
            'page': paginated_replies.page,
            'per_page': paginated_replies.per_page,
            'total': paginated_replies.total,
            'pages': paginated_replies.pages,
            'has_next': paginated_replies.has_next,
            'has_prev': paginated_replies.has_prev
        }
    }), 200

@comments_bp.route('/<int:comment_id>', methods=['PUT'])
@jwt_required()
def edit_comment(comment_id):
    """Edit a comment (only by the author)"""
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)
    
    # Only comment author can edit
    if comment.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    new_content = data.get('content')
    
    if not new_content or len(new_content.strip()) == 0:
        return jsonify({'error': 'Content is required'}), 400
    
    if len(new_content) > 1000:
        return jsonify({'error': 'Comment too long (max 1000 characters)'}), 400
    
    comment.content = new_content.strip()
    comment.timestamp = datetime.utcnow()  # Update timestamp to show it was edited
    db.session.commit()
    
    return jsonify({
        'message': 'Comment updated successfully',
        'comment': {
            'id': comment.id,
            'content': comment.content,
            'timestamp': comment.timestamp.isoformat(),
            'edited': True
        }
    }), 200

def _is_comment_liked(comment_id, user_id):
    """Helper function to check if user liked a comment"""
    if not user_id:
        return False
    return CommentLike.query.filter_by(comment_id=comment_id, user_id=user_id).first() is not None


