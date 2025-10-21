"""
방제 계획 API 라우트
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.spray_plan import SprayPlan

bp = Blueprint('plans', __name__, url_prefix='/api/plans')


@bp.route('', methods=['GET'])
def get_plans():
    """모든 방제 계획 조회"""
    try:
        # 쿼리 파라미터 필터링
        field_id = request.args.get('field_id')
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        query = SprayPlan.query

        if field_id:
            query = query.filter_by(field_id=field_id)
        if status:
            query = query.filter_by(status=status)
        if start_date:
            query = query.filter(SprayPlan.scheduled_date >= datetime.fromisoformat(start_date).date())
        if end_date:
            query = query.filter(SprayPlan.scheduled_date <= datetime.fromisoformat(end_date).date())

        plans = query.order_by(SprayPlan.scheduled_date.desc()).all()

        return jsonify({
            'success': True,
            'data': [plan.to_dict() for plan in plans],
            'count': len(plans)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<plan_id>', methods=['GET'])
def get_plan(plan_id):
    """특정 방제 계획 조회"""
    try:
        plan = SprayPlan.query.get_or_404(plan_id)
        return jsonify({
            'success': True,
            'data': plan.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404


@bp.route('', methods=['POST'])
def create_plan():
    """방제 계획 생성"""
    try:
        data = request.get_json()

        plan = SprayPlan(
            field_id=data.get('field_id'),
            scheduled_date=datetime.fromisoformat(data.get('scheduled_date')).date(),
            pesticide_name=data.get('pesticide_name'),
            pesticide_amount=data.get('pesticide_amount'),
            target_pest=data.get('target_pest'),
            status=data.get('status', 'scheduled'),
            weather_condition=data.get('weather_condition'),
            notes=data.get('notes')
        )

        db.session.add(plan)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': plan.to_dict(),
            'message': '방제 계획이 성공적으로 생성되었습니다.'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<plan_id>', methods=['PUT'])
def update_plan(plan_id):
    """방제 계획 수정"""
    try:
        plan = SprayPlan.query.get_or_404(plan_id)
        data = request.get_json()

        if 'scheduled_date' in data:
            plan.scheduled_date = datetime.fromisoformat(data['scheduled_date']).date()
        if 'pesticide_name' in data:
            plan.pesticide_name = data['pesticide_name']
        if 'pesticide_amount' in data:
            plan.pesticide_amount = data['pesticide_amount']
        if 'target_pest' in data:
            plan.target_pest = data['target_pest']
        if 'status' in data:
            plan.status = data['status']
        if 'weather_condition' in data:
            plan.weather_condition = data['weather_condition']
        if 'notes' in data:
            plan.notes = data['notes']

        db.session.commit()

        return jsonify({
            'success': True,
            'data': plan.to_dict(),
            'message': '방제 계획이 성공적으로 수정되었습니다.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/<plan_id>', methods=['DELETE'])
def delete_plan(plan_id):
    """방제 계획 삭제"""
    try:
        plan = SprayPlan.query.get_or_404(plan_id)
        db.session.delete(plan)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '방제 계획이 성공적으로 삭제되었습니다.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
