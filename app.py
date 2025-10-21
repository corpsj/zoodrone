"""
ZooDrone - 드론 방제 관리 시스템
Flask 애플리케이션 메인 엔트리포인트
"""
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from config import Config
from database import db
import os

# Flask 앱 초기화
app = Flask(__name__)
app.config.from_object(Config)

# CORS 설정
CORS(app)

# 데이터베이스 초기화
db.init_app(app)

# 업로드 폴더 생성
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 모델 임포트 (테이블 생성을 위해 필요)
from models import Field, SprayPlan, FlightPath, WorkHistory

# 라우트 등록
from routes import fields, plans, paths, history, reports

app.register_blueprint(fields.bp)
app.register_blueprint(plans.bp)
app.register_blueprint(paths.bp)
app.register_blueprint(history.bp)
app.register_blueprint(reports.bp)


# 메인 페이지 라우트
@app.route('/')
def index():
    """대시보드 메인 페이지"""
    return render_template('dashboard.html')


@app.route('/fields')
def fields_page():
    """필지 관리 페이지"""
    return render_template('fields.html')


@app.route('/plans')
def plans_page():
    """방제 계획 페이지"""
    return render_template('plans.html')


@app.route('/paths')
def paths_page():
    """비행 경로 페이지"""
    return render_template('paths.html')


@app.route('/history')
def history_page():
    """작업 이력 페이지"""
    return render_template('history.html')


@app.route('/reports')
def reports_page():
    """보고서 페이지"""
    return render_template('reports.html')


# 헬스체크 엔드포인트
@app.route('/api/health')
def health_check():
    """API 헬스체크"""
    return jsonify({
        'status': 'healthy',
        'service': 'ZooDrone API',
        'version': '1.0.0'
    })


# 에러 핸들러
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # 데이터베이스 초기화
    with app.app_context():
        db.create_all()
        print("✓ Database initialized successfully!")

    app.run(
        host=app.config.get('HOST', '0.0.0.0'),
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', True)
    )
