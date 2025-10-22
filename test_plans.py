"""
방제 계획 테스트 데이터 생성
"""
from app import app
from database import db
from models.field import Field
from models.spray_plan import SprayPlan
from datetime import date, timedelta

with app.app_context():
    # 기존 필지 가져오기
    fields = Field.query.all()

    if not fields:
        print("필지가 없습니다. 먼저 필지를 생성해주세요.")
        exit(1)

    # 기존 방제 계획 삭제
    SprayPlan.query.delete()

    # 테스트 방제 계획 생성
    today = date.today()

    plans = [
        SprayPlan(
            field_id=fields[0].id,
            scheduled_date=today + timedelta(days=2),
            pesticide_name='다이센엠-45',
            pesticide_amount=15.0,
            target_pest='노균병',
            status='scheduled',
            notes='날씨 좋을 때 살포 예정'
        ),
        SprayPlan(
            field_id=fields[1].id if len(fields) > 1 else fields[0].id,
            scheduled_date=today + timedelta(days=5),
            pesticide_name='살비왕',
            pesticide_amount=8.5,
            target_pest='응애',
            status='scheduled',
            notes='응애 발생 초기 방제'
        ),
        SprayPlan(
            field_id=fields[0].id,
            scheduled_date=today - timedelta(days=7),
            pesticide_name='스트로비',
            pesticide_amount=12.0,
            target_pest='흰가루병',
            status='completed',
            notes='완료 - 날씨 맑음'
        ),
        SprayPlan(
            field_id=fields[2].id if len(fields) > 2 else fields[0].id,
            scheduled_date=today,
            pesticide_name='코사이드',
            pesticide_amount=20.0,
            target_pest='세균병',
            status='scheduled',
            notes='오늘 오후 작업 예정'
        ),
        SprayPlan(
            field_id=fields[1].id if len(fields) > 1 else fields[0].id,
            scheduled_date=today - timedelta(days=14),
            pesticide_name='오티바',
            pesticide_amount=10.5,
            target_pest='잿빛곰팡이병',
            status='completed',
            notes='완료 - 효과 양호'
        ),
        SprayPlan(
            field_id=fields[0].id,
            scheduled_date=today + timedelta(days=10),
            pesticide_name='델란',
            pesticide_amount=18.0,
            target_pest='탄저병',
            status='scheduled',
            notes='예방 차원 살포'
        )
    ]

    for plan in plans:
        db.session.add(plan)

    db.session.commit()

    print(f"✅ {len(plans)}개의 방제 계획이 생성되었습니다.")
    print("\n방제 계획 목록:")
    for plan in SprayPlan.query.order_by(SprayPlan.scheduled_date.desc()).all():
        print(f"  - {plan.scheduled_date} | {plan.field.name} | {plan.pesticide_name} | {plan.status}")
