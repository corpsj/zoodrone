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
        return jsonify({'success': False, 'error': '방제 계획 목록을 불러오는데 실패했습니다.'}), 500


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
        return jsonify({'success': False, 'error': '방제 계획을 찾을 수 없습니다.'}), 404


@bp.route('', methods=['POST'])
def create_plan():
    """방제 계획 생성"""
    try:
        data = request.get_json()

        # 필수 필드 검증
        if not data.get('field_id'):
            return jsonify({'success': False, 'error': '필지를 선택해주세요.'}), 400
        if not data.get('scheduled_date'):
            return jsonify({'success': False, 'error': '예정일을 입력해주세요.'}), 400
        if not data.get('pesticide_name'):
            return jsonify({'success': False, 'error': '농약명을 입력해주세요.'}), 400
        if not data.get('pesticide_amount') or float(data.get('pesticide_amount', 0)) <= 0:
            return jsonify({'success': False, 'error': '유효한 살포량을 입력해주세요.'}), 400

        # 상태 검증
        valid_statuses = ['scheduled', 'completed', 'cancelled']
        status = data.get('status', 'scheduled')
        if status not in valid_statuses:
            return jsonify({'success': False, 'error': '유효하지 않은 상태입니다.'}), 400

        plan = SprayPlan(
            field_id=data.get('field_id'),
            scheduled_date=datetime.fromisoformat(data.get('scheduled_date')).date(),
            pesticide_name=data.get('pesticide_name'),
            pesticide_amount=float(data.get('pesticide_amount')),
            target_pest=data.get('target_pest'),
            status=status,
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
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '입력값 형식이 올바르지 않습니다.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '방제 계획 생성 중 오류가 발생했습니다.'}), 500


@bp.route('/<plan_id>', methods=['PUT'])
def update_plan(plan_id):
    """방제 계획 수정"""
    try:
        plan = SprayPlan.query.get_or_404(plan_id)
        data = request.get_json()

        # 유효성 검사
        if 'pesticide_name' in data and not data['pesticide_name']:
            return jsonify({'success': False, 'error': '농약명은 필수입니다.'}), 400
        if 'pesticide_amount' in data and float(data.get('pesticide_amount', 0)) <= 0:
            return jsonify({'success': False, 'error': '유효한 살포량을 입력해주세요.'}), 400
        if 'status' in data:
            valid_statuses = ['scheduled', 'completed', 'cancelled']
            if data['status'] not in valid_statuses:
                return jsonify({'success': False, 'error': '유효하지 않은 상태입니다.'}), 400

        # 수정 가능한 필드 업데이트
        if 'field_id' in data:
            plan.field_id = data['field_id']
        if 'scheduled_date' in data:
            plan.scheduled_date = datetime.fromisoformat(data['scheduled_date']).date()
        if 'pesticide_name' in data:
            plan.pesticide_name = data['pesticide_name']
        if 'pesticide_amount' in data:
            plan.pesticide_amount = float(data['pesticide_amount'])
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
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '입력값 형식이 올바르지 않습니다.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '방제 계획 수정 중 오류가 발생했습니다.'}), 500


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
        return jsonify({'success': False, 'error': '방제 계획 삭제 중 오류가 발생했습니다.'}), 500
