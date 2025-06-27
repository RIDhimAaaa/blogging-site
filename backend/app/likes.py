from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, Like, CommentLike, Blog, Comment

likes_bp = Blueprint('likes', __name__)

# ---------- Blog Likes ----------

@likes_bp.route('/blog/<int:blog_id>', methods=['POST'])
@jwt_required()
def toggle_blog_like(blog_id):
    user_id = get_jwt_identity()
    blog = Blog.query.get_or_404(blog_id)

    existing_like = Like.query.filter_by(user_id=user_id, blog_id=blog_id).first()

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({'message': 'Unliked blog'}), 200
    else:
        like = Like(user_id=user_id, blog_id=blog_id)
        db.session.add(like)
        db.session.commit()
        return jsonify({'message': 'Liked blog'}), 201


@likes_bp.route('/blog/<int:blog_id>', methods=['GET'])
def get_blog_like_count(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    count = len(blog.likes)
    return jsonify({'likes': count}), 200


# ---------- Comment Likes ----------

@likes_bp.route('/comment/<int:comment_id>', methods=['POST'])
@jwt_required()
def toggle_comment_like(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)

    existing_like = CommentLike.query.filter_by(user_id=user_id, comment_id=comment_id).first()

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({'message': 'Unliked comment'}), 200
    else:
        like = CommentLike(user_id=user_id, comment_id=comment_id, blog_id=comment.blog_id)
        db.session.add(like)
        db.session.commit()
        return jsonify({'message': 'Liked comment'}), 201


@likes_bp.route('/comment/<int:comment_id>', methods=['GET'])
def get_comment_like_count(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    count = len(comment.likes)
    return jsonify({'likes': count}), 200
