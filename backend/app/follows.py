from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import User, Follow, db
from sqlalchemy import func

follows_bp = Blueprint('follows', __name__, url_prefix='/api/follows')

@follows_bp.route('/<int:user_id>', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    """Follow or unfollow a user"""
    follower_id = int(get_jwt_identity())
    
    # Prevent following yourself
    if follower_id == user_id:
        return jsonify({'error': 'You cannot follow yourself'}), 400
    
    # Check if user exists
    user_to_follow = User.query.get(user_id)
    if not user_to_follow:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if already following
    existing_follow = Follow.query.filter_by(
        follower_id=follower_id, 
        followed_id=user_id
    ).first()
    
    if existing_follow:
        # Unfollow
        db.session.delete(existing_follow)
        db.session.commit()
        
        # Get updated counts
        followers_count = Follow.query.filter_by(followed_id=user_id).count()
        following_count = Follow.query.filter_by(follower_id=follower_id).count()
        
        return jsonify({
            'message': f'Unfollowed {user_to_follow.username}',
            'is_following': False,
            'followers_count': followers_count,
            'following_count': following_count
        }), 200
    else:
        # Follow
        new_follow = Follow(follower_id=follower_id, followed_id=user_id)
        db.session.add(new_follow)
        db.session.commit()
        
        # Get updated counts
        followers_count = Follow.query.filter_by(followed_id=user_id).count()
        following_count = Follow.query.filter_by(follower_id=follower_id).count()
        
        return jsonify({
            'message': f'Now following {user_to_follow.username}',
            'is_following': True,
            'followers_count': followers_count,
            'following_count': following_count
        }), 201

@follows_bp.route('/check/<int:user_id>', methods=['GET'])
@jwt_required()
def check_follow_status(user_id):
    """Check if current user is following a specific user"""
    follower_id = int(get_jwt_identity())
    
    if follower_id == user_id:
        return jsonify({
            'is_following': False,
            'is_self': True
        }), 200
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check follow status
    is_following = Follow.query.filter_by(
        follower_id=follower_id, 
        followed_id=user_id
    ).first() is not None
    
    return jsonify({
        'is_following': is_following,
        'is_self': False,
        'username': user.username
    }), 200

@follows_bp.route('/followers/<int:user_id>', methods=['GET'])
def get_followers(user_id):
    """Get list of users who follow this user"""
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get followers with pagination
    followers_query = db.session.query(User).join(
        Follow, User.id == Follow.follower_id
    ).filter(Follow.followed_id == user_id).order_by(Follow.timestamp.desc())
    
    paginated_followers = followers_query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    followers_list = []
    for follower in paginated_followers.items:
        followers_list.append({
            'id': follower.id,
            'username': follower.username,
            'joined_date': follower.created_at.isoformat() if hasattr(follower, 'created_at') else None
        })
    
    return jsonify({
        'followers': followers_list,
        'pagination': {
            'page': paginated_followers.page,
            'per_page': paginated_followers.per_page,
            'total': paginated_followers.total,
            'pages': paginated_followers.pages,
            'has_next': paginated_followers.has_next,
            'has_prev': paginated_followers.has_prev,
            'next_num': paginated_followers.next_num if paginated_followers.has_next else None,
            'prev_num': paginated_followers.prev_num if paginated_followers.has_prev else None
        },
        'user': {
            'id': user.id,
            'username': user.username
        }
    }), 200

@follows_bp.route('/following/<int:user_id>', methods=['GET'])
def get_following(user_id):
    """Get list of users that this user follows"""
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
    
    # Validate pagination parameters
    if page < 1:
        return jsonify({'error': 'Page must be 1 or greater'}), 400
    if per_page < 1:
        return jsonify({'error': 'Items per page must be 1 or greater'}), 400
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get following with pagination
    following_query = db.session.query(User).join(
        Follow, User.id == Follow.followed_id
    ).filter(Follow.follower_id == user_id).order_by(Follow.timestamp.desc())
    
    paginated_following = following_query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    following_list = []
    for followed_user in paginated_following.items:
        following_list.append({
            'id': followed_user.id,
            'username': followed_user.username,
            'joined_date': followed_user.created_at.isoformat() if hasattr(followed_user, 'created_at') else None
        })
    
    return jsonify({
        'following': following_list,
        'pagination': {
            'page': paginated_following.page,
            'per_page': paginated_following.per_page,
            'total': paginated_following.total,
            'pages': paginated_following.pages,
            'has_next': paginated_following.has_next,
            'has_prev': paginated_following.has_prev,
            'next_num': paginated_following.next_num if paginated_following.has_next else None,
            'prev_num': paginated_following.prev_num if paginated_following.has_prev else None
        },
        'user': {
            'id': user.id,
            'username': user.username
        }
    }), 200

@follows_bp.route('/stats/<int:user_id>', methods=['GET'])
def get_follow_stats(user_id):
    """Get follower and following counts for a user"""
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get counts
    followers_count = Follow.query.filter_by(followed_id=user_id).count()
    following_count = Follow.query.filter_by(follower_id=user_id).count()
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username
        },
        'followers_count': followers_count,
        'following_count': following_count
    }), 200
