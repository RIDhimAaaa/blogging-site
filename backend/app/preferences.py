# app/preferences.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, User, UserCategoryPreference
from .blogs import BLOG_CATEGORIES, validate_category

preferences_bp = Blueprint('preferences', __name__, url_prefix='/api/preferences')

@preferences_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_user_category_preferences():
    """Get user's selected category preferences"""
    user_id = get_jwt_identity()
    
    preferences = UserCategoryPreference.query.filter_by(user_id=user_id).all()
    preferred_categories = [pref.category for pref in preferences]
    
    return jsonify({
        'preferred_categories': preferred_categories,
        'total': len(preferred_categories),
        'available_categories': BLOG_CATEGORIES
    }), 200

@preferences_bp.route('/categories', methods=['POST'])
@jwt_required()
def set_user_category_preferences():
    """Set user's category preferences (replaces existing preferences)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    categories = data.get('categories', [])
    
    if not isinstance(categories, list):
        return jsonify({'error': 'Categories must be a list'}), 400
    
    if len(categories) > 10:  # Limit to prevent abuse
        return jsonify({'error': 'Maximum 10 categories allowed'}), 400
    
    # Validate all categories
    invalid_categories = []
    for category in categories:
        if not validate_category(category):
            invalid_categories.append(category)
    
    if invalid_categories:
        return jsonify({
            'error': f'Invalid categories: {", ".join(invalid_categories)}',
            'available_categories': BLOG_CATEGORIES
        }), 400
    
    # Remove existing preferences
    UserCategoryPreference.query.filter_by(user_id=user_id).delete()
    
    # Add new preferences
    for category in categories:
        preference = UserCategoryPreference(
            user_id=user_id,
            category=category.lower()
        )
        db.session.add(preference)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Category preferences updated successfully',
        'preferred_categories': [cat.lower() for cat in categories],
        'total': len(categories)
    }), 200

@preferences_bp.route('/categories', methods=['PUT'])
@jwt_required()
def add_category_preference():
    """Add a single category to user's preferences"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    category = data.get('category')
    if not category:
        return jsonify({'error': 'Category is required'}), 400
    
    if not validate_category(category):
        return jsonify({
            'error': f'Invalid category: {category}',
            'available_categories': BLOG_CATEGORIES
        }), 400
    
    category = category.lower()
    
    # Check if already exists
    existing = UserCategoryPreference.query.filter_by(
        user_id=user_id, 
        category=category
    ).first()
    
    if existing:
        return jsonify({'message': 'Category already in preferences'}), 200
    
    # Check limit
    current_count = UserCategoryPreference.query.filter_by(user_id=user_id).count()
    if current_count >= 10:
        return jsonify({'error': 'Maximum 10 categories allowed'}), 400
    
    preference = UserCategoryPreference(
        user_id=user_id,
        category=category
    )
    db.session.add(preference)
    db.session.commit()
    
    return jsonify({
        'message': 'Category added to preferences',
        'category': category
    }), 201

@preferences_bp.route('/categories/<string:category>', methods=['DELETE'])
@jwt_required()
def remove_category_preference(category):
    """Remove a category from user's preferences"""
    user_id = get_jwt_identity()
    category = category.lower()
    
    preference = UserCategoryPreference.query.filter_by(
        user_id=user_id,
        category=category
    ).first()
    
    if not preference:
        return jsonify({'error': 'Category not found in preferences'}), 404
    
    db.session.delete(preference)
    db.session.commit()
    
    return jsonify({
        'message': 'Category removed from preferences',
        'category': category
    }), 200
