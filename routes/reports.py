"""
대시보드 & 보고서 API 라우트
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func
from database import db
from models.field import Field
from models.spray_plan import SprayPlan
from models.work_history import WorkHistory

bp = Blueprint('reports', __name__, url_prefix='/api')


@bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """대시보드 통계 데이터"""
    try:
        # 총 필지 수
        total_fields = Field.query.count()

        # 이번 주 방제 완료/예정 건수
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        plans_this_week = SprayPlan.query.filter(
            SprayPlan.scheduled_date >= week_start,
            SprayPlan.scheduled_date <= week_end
        ).count()

        completed_this_week = SprayPlan.query.filter(
            SprayPlan.scheduled_date >= week_start,
            SprayPlan.scheduled_date <= week_end,
            SprayPlan.status == 'completed'
        ).count()

        # 오늘의 일정
        today_plans = SprayPlan.query.filter_by(
            scheduled_date=today
        ).order_by(SprayPlan.created_at).all()

        # 최근 작업 이력
        recent_histories = WorkHistory.query.order_by(
            WorkHistory.actual_date.desc()
        ).limit(5).all()

        # 총 방제 면적 (이번 달)
        month_start = today.replace(day=1)
        monthly_area = db.session.query(
            func.sum(Field.area)
        ).join(WorkHistory).filter(
            WorkHistory.actual_date >= month_start
        ).scalar() or 0

        return jsonify({
            'success': True,
            'data': {
                'total_fields': total_fields,
                'plans_this_week': plans_this_week,
                'completed_this_week': completed_this_week,
                'today_plans': [plan.to_dict() for plan in today_plans],
                'recent_histories': [history.to_dict() for history in recent_histories],
                'monthly_area': float(monthly_area)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/reports/summary', methods=['GET'])
def get_summary_report():
    """기간별 요약 리포트"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        query = WorkHistory.query

        if start_date:
            query = query.filter(WorkHistory.actual_date >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(WorkHistory.actual_date <= datetime.fromisoformat(end_date))

        histories = query.all()

        # 통계 계산
        total_works = len(histories)
        total_area = sum([h.field.area for h in histories if h.field])
        total_pesticide = sum([h.pesticide_used for h in histories if h.pesticide_used])
        total_flight_time = sum([h.flight_time for h in histories if h.flight_time])

        return jsonify({
            'success': True,
            'data': {
                'total_works': total_works,
                'total_area': total_area,
                'total_pesticide': total_pesticide,
                'total_flight_time': total_flight_time,
                'histories': [h.to_dict() for h in histories]
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/reports/pesticide', methods=['GET'])
def get_pesticide_report():
    """농약 사용 리포트"""
    try:
        # 농약별 사용량 집계
        pesticide_usage = db.session.query(
            SprayPlan.pesticide_name,
            func.sum(SprayPlan.pesticide_amount).label('total_amount'),
            func.count(SprayPlan.id).label('usage_count')
        ).group_by(SprayPlan.pesticide_name).all()

        return jsonify({
            'success': True,
            'data': [{
                'pesticide_name': item[0],
                'total_amount': float(item[1]) if item[1] else 0,
                'usage_count': item[2]
            } for item in pesticide_usage]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/reports/costs', methods=['GET'])
def get_cost_report():
    """비용 분석 리포트"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # TODO: 실제 비용 계산 로직은 Phase 6에서 구현
        # 현재는 기본 구조만 반환

        return jsonify({
            'success': True,
            'data': {
                'total_cost': 0,
                'pesticide_cost': 0,
                'labor_cost': 0,
                'details': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
