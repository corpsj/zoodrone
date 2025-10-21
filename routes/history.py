"""
작업 이력 API 라우트
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.work_history import WorkHistory

bp = Blueprint('history', __name__, url_prefix='/api/history')


@bp.route('', methods=['GET'])
def get_histories():
    """모든 작업 이력 조회"""
    try:
        field_id = request.args.get('field_id')
        operator = request.args.get('operator')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        query = WorkHistory.query

        if field_id:
            query = query.filter_by(field_id=field_id)
        if operator:
            query = query.filter_by(operator=operator)
        if start_date:
            query = query.filter(WorkHistory.actual_date >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(WorkHistory.actual_date <= datetime.fromisoformat(end_date))

        histories = query.order_by(WorkHistory.actual_date.desc()).all()

        return jsonify({
            'success': True,
            'data': [history.to_dict() for history in histories],
            'count': len(histories)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<history_id>', methods=['GET'])
def get_history(history_id):
    """특정 작업 이력 조회"""
    try:
        history = WorkHistory.query.get_or_404(history_id)
        return jsonify({
            'success': True,
            'data': history.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404


@bp.route('', methods=['POST'])
def create_history():
    """작업 이력 생성"""
    try:
        data = request.get_json()

        history = WorkHistory(
            spray_plan_id=data.get('spray_plan_id'),
            field_id=data.get('field_id'),
            flight_path_id=data.get('flight_path_id'),
            actual_date=datetime.fromisoformat(data.get('actual_date')),
            operator=data.get('operator'),
            drone_model=data.get('drone_model'),
            flight_time=data.get('flight_time'),
            battery_used=data.get('battery_used'),
            pesticide_used=data.get('pesticide_used'),
            weather_actual=data.get('weather_actual'),
            photos=data.get('photos', []),
            notes=data.get('notes')
        )

        db.session.add(history)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': history.to_dict(),
            'message': '작업 이력이 성공적으로 생성되었습니다.'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<history_id>', methods=['PUT'])
def update_history(history_id):
    """작업 이력 수정"""
    try:
        history = WorkHistory.query.get_or_404(history_id)
        data = request.get_json()

        if 'actual_date' in data:
            history.actual_date = datetime.fromisoformat(data['actual_date'])
        if 'operator' in data:
            history.operator = data['operator']
        if 'drone_model' in data:
            history.drone_model = data['drone_model']
        if 'flight_time' in data:
            history.flight_time = data['flight_time']
        if 'battery_used' in data:
            history.battery_used = data['battery_used']
        if 'pesticide_used' in data:
            history.pesticide_used = data['pesticide_used']
        if 'weather_actual' in data:
            history.weather_actual = data['weather_actual']
        if 'photos' in data:
            history.photos = data['photos']
        if 'notes' in data:
            history.notes = data['notes']

        db.session.commit()

        return jsonify({
            'success': True,
            'data': history.to_dict(),
            'message': '작업 이력이 성공적으로 수정되었습니다.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<history_id>', methods=['DELETE'])
def delete_history(history_id):
    """작업 이력 삭제"""
    try:
        history = WorkHistory.query.get_or_404(history_id)
        db.session.delete(history)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '작업 이력이 성공적으로 삭제되었습니다.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<history_id>/photos', methods=['POST'])
def upload_photos(history_id):
    """사진 업로드"""
    try:
        history = WorkHistory.query.get_or_404(history_id)

        # TODO: 실제 파일 업로드는 Phase 5에서 구현
        # 현재는 URL만 저장
        data = request.get_json()
        photos = data.get('photos', [])

        current_photos = history.photos or []
        current_photos.extend(photos)
        history.photos = current_photos

        db.session.commit()

        return jsonify({
            'success': True,
            'data': history.to_dict(),
            'message': '사진이 성공적으로 업로드되었습니다.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
