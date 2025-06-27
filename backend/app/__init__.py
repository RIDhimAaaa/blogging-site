from flask import Flask, jsonify, json
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from flask_swagger_ui import get_swaggerui_blueprint
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3
import os

# --- Initialize Extensions ---
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
mail = Mail()
jwt = JWTManager()


@event.listens_for(Engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

def create_app():
    app = Flask(__name__)

    from .config import Config
    app.config.from_object(Config)

    # --- Bind Extensions to the App ---
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    mail.init_app(app)
    jwt.init_app(app)

    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "msg": "Invalid token",
            "error": str(error)
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "msg": "Missing Bearer token. Expected 'Authorization: Bearer <JWT>'",
            "error": str(error)
        }), 401
    
    # Configure Swagger UI
    SWAGGER_URL = '/api/docs'
    API_URL = '/static/swagger.json'
    
    # Create Swagger UI blueprint
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Blogging API",
            'oauth2RedirectUrl': f"{Config.FRONTEND_URL}/oauth2-redirect.html"
        }
    )
    
    # Create static folder if it doesn't exist
    if not os.path.exists(os.path.join(app.root_path, 'static')):
        os.makedirs(os.path.join(app.root_path, 'static'))
          # Copy swagger.json to static folder
    with open(os.path.join(app.root_path, 'swagger.json'), 'r') as f:
        swagger_data = json.load(f)
    
    with open(os.path.join(app.root_path, 'static', 'swagger.json'), 'w') as f:
        json.dump(swagger_data, f)
    
    # Register Swagger UI blueprint
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
    
    CORS(app)

    # Register blueprints
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from .blogs import blogs_bp
    app.register_blueprint(blogs_bp, url_prefix="/api/blogs")

    from .comments import comments_bp  
    app.register_blueprint(comments_bp, url_prefix="/api/comments")

    from .likes import likes_bp
    app.register_blueprint(likes_bp, url_prefix='/api/likes')

    from .preferences import preferences_bp
    app.register_blueprint(preferences_bp, url_prefix='/api/preferences')

    from .users import users_bp
    app.register_blueprint(users_bp, url_prefix='/api/users')

    from .follows import follows_bp
    app.register_blueprint(follows_bp, url_prefix='/api/follows')


    with app.app_context():
        db.create_all()

    return app
