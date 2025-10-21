"""
비행 경로 API 라우트
"""
from flask import Blueprint, request, jsonify
from database import db
from models.flight_path import FlightPath

bp = Blueprint('paths', __name__, url_prefix='/api/paths')


@bp.route('', methods=['GET'])
def get_paths():
    """모든 비행 경로 조회"""
    try:
        field_id = request.args.get('field_id')

        query = FlightPath.query
        if field_id:
            query = query.filter_by(field_id=field_id)

        paths = query.order_by(FlightPath.created_at.desc()).all()

        return jsonify({
            'success': True,
            'data': [path.to_dict() for path in paths],
            'count': len(paths)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<path_id>', methods=['GET'])
def get_path(path_id):
    """특정 비행 경로 조회"""
    try:
        path = FlightPath.query.get_or_404(path_id)
        return jsonify({
            'success': True,
            'data': path.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404


@bp.route('/generate', methods=['POST'])
def generate_path():
    """비행 경로 생성"""
    try:
        data = request.get_json()

        # TODO: 실제 경로 생성 알고리즘은 Phase 4에서 구현
        # 현재는 기본 구조만 생성

        path = FlightPath(
            field_id=data.get('field_id'),
            spray_plan_id=data.get('spray_plan_id'),
            path_data=data.get('path_data', []),
            spacing=data.get('spacing', 5.0),
            altitude=data.get('altitude', 3.0),
            total_distance=data.get('total_distance', 0),
            estimated_time=data.get('estimated_time', 0),
            notes=data.get('notes')
        )

        db.session.add(path)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': path.to_dict(),
            'message': '비행 경로가 성공적으로 생성되었습니다.'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<path_id>', methods=['DELETE'])
def delete_path(path_id):
    """비행 경로 삭제"""
    try:
        path = FlightPath.query.get_or_404(path_id)
        db.session.delete(path)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '비행 경로가 성공적으로 삭제되었습니다.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<path_id>/download', methods=['GET'])
def download_path(path_id):
    """비행 경로 다운로드"""
    try:
        path = FlightPath.query.get_or_404(path_id)
        format_type = request.args.get('format', 'json')

        # TODO: KML 형식 지원은 Phase 4에서 구현

        return jsonify({
            'success': True,
            'data': path.to_dict(),
            'format': format_type
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
