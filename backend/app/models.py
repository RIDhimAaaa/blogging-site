from . import db, bcrypt
from datetime import datetime
from flask_login import UserMixin

# Inherit from UserMixin to integrate with Flask-Login
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False) # Bcrypt hash is 60 chars, 128 is safe
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New field for email verification status
    is_verified = db.Column(db.Boolean, nullable=False, default=False)

    def set_password(self, password):
        """Hashes the password using Bcrypt."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Checks the password against the stored Bcrypt hash."""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'
    
blog_tags = db.Table('blog_tags',
    db.Column('blog_id', db.Integer, db.ForeignKey('blog.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)



class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    category = db.Column(db.String(50), nullable=True)  # New field
    is_draft = db.Column(db.Boolean, default=False)
    is_archived = db.Column(db.Boolean, default=False)


    # Relationship with tags
    tags = db.relationship('Tag', secondary=blog_tags, backref=db.backref('blogs', lazy='dynamic'))


    # Updated relationships with cascade options
    user = db.relationship('User', backref=db.backref('blogs', lazy=True, cascade='all, delete-orphan'))
    likes = db.relationship('Like', backref='blog', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='blog', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('idx_blog_user', 'user_id'),
    )

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog.id', ondelete="CASCADE"), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Updated relationship with cascade
    user = db.relationship('User', backref=db.backref('likes', lazy=True, cascade='all, delete'))

    __table_args__ = (
        db.UniqueConstraint('blog_id', 'user_id', name='unique_like'),
        db.Index('idx_like_blog', 'blog_id'),
        db.Index('idx_like_user', 'user_id')
    )

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog.id', ondelete="CASCADE"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id', ondelete="CASCADE"), nullable=True)

    # Updated relationships with cascade
    user = db.relationship('User', backref=db.backref('comments', lazy=True, cascade='all, delete'))
    parent = db.relationship('Comment', 
                           remote_side=[id], 
                           backref=db.backref('replies', lazy=True, cascade='all, delete-orphan'))
    likes = db.relationship('CommentLike', backref='comment', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('idx_comment_blog', 'blog_id'),
        db.Index('idx_comment_user', 'user_id'),
        db.Index('idx_comment_parent', 'parent_id')
    )

    @property
    def like_count(self):
         return len(self.likes)

class CommentLike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id', ondelete="CASCADE"), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog.id', ondelete="CASCADE"), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Updated relationship with cascade
    user = db.relationship('User', backref=db.backref('comment_likes', lazy=True, cascade='all, delete'))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'comment_id', name='unique_comment_like'),
        db.Index('idx_comment_like_user', 'user_id'),
        db.Index('idx_comment_like_comment', 'comment_id'),
        db.Index('idx_comment_like_blog', 'blog_id')
    )

# User category preferences for personalized recommendations
class UserCategoryPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship back to user
    user = db.relationship('User', backref=db.backref('category_preferences', lazy=True, cascade='all, delete'))
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'category', name='unique_user_category_preference'),
        db.Index('idx_user_category_pref', 'user_id', 'category')
    )

    def __repr__(self):
        return f'<UserCategoryPreference user_id={self.user_id} category={self.category}>'


class BlogView(db.Model):
    __tablename__ = 'blog_view'
    id = db.Column(db.Integer, primary_key=True)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Nullable for anonymous views
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    blog = db.relationship('Blog', backref='views')
    user = db.relationship('User', backref='blog_views')

# User follow system
class Follow(db.Model):
    __tablename__ = 'follow'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)  # User who follows
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)  # User being followed
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    follower = db.relationship('User', foreign_keys=[follower_id], backref='following')
    followed = db.relationship('User', foreign_keys=[followed_id], backref='followers')
    
    # Constraints and indexes
    __table_args__ = (
        db.UniqueConstraint('follower_id', 'followed_id', name='unique_follow'),
        db.Index('idx_follow_follower', 'follower_id'),
        db.Index('idx_follow_followed', 'followed_id'),
        # Prevent users from following themselves
        db.CheckConstraint('follower_id != followed_id', name='no_self_follow')
    )

    def __repr__(self):
        return f'<Follow follower_id={self.follower_id} followed_id={self.followed_id}>'

