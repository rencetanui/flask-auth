import os

class Config:
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your_secret_key") 
    
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///users.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False