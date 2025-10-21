"""
ZooDrone 애플리케이션 설정
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 프로젝트 루트 디렉토리
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Flask 애플리케이션 설정 클래스"""

    # 기본 설정
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-please-change-in-production')
    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))

    # 데이터베이스 설정
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(basedir, "data", "zoodrone.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = DEBUG

    # 파일 업로드 설정
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', os.path.join(basedir, 'data', 'uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_UPLOAD_SIZE', 16 * 1024 * 1024))  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

    # API 키
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')

    # 세션 설정
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # CORS 설정
    CORS_HEADERS = 'Content-Type'

    # 페이지네이션
    ITEMS_PER_PAGE = 20

    # 드론 설정 기본값
    DEFAULT_FLIGHT_ALTITUDE = 3.0  # 미터
    DEFAULT_SPRAY_WIDTH = 5.0  # 미터
    DEFAULT_FLIGHT_SPEED = 5.0  # m/s

    @staticmethod
    def allowed_file(filename):
        """허용된 파일 확장자 검사"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS
