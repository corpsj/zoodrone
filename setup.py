#!/usr/bin/env python
"""
ZooDrone 초기 설정 스크립트
데이터베이스 생성 및 테스트 데이터 로드를 한 번에 수행합니다.
"""
import os
import sys

def main():
    print("=" * 60)
    print("ZooDrone 초기 설정을 시작합니다")
    print("=" * 60)

    # 1. 데이터베이스 초기화
    print("\n[1/3] 데이터베이스 초기화 중...")
    from app import app
    from database import db

    with app.app_context():
        db.create_all()
        print("✓ 데이터베이스가 생성되었습니다.")

    # 2. 테스트 필지 데이터 생성 여부 확인
    print("\n[2/3] 테스트 필지 데이터 생성")
    response = input("테스트 필지를 생성하시겠습니까? (y/n) [y]: ").strip().lower()

    if response in ['', 'y', 'yes']:
        from models.field import Field
        from datetime import datetime

        with app.app_context():
            # 기존 데이터 확인
            existing_count = Field.query.count()
            if existing_count > 0:
                print(f"  이미 {existing_count}개의 필지가 존재합니다.")
                overwrite = input("  기존 데이터를 삭제하고 새로 생성하시겠습니까? (y/n) [n]: ").strip().lower()
                if overwrite in ['y', 'yes']:
                    Field.query.delete()
                    db.session.commit()
                else:
                    print("  기존 데이터를 유지합니다.")
                    sys.exit(0)

            # 테스트 필지 생성
            test_fields = [
                Field(
                    name='테스트 필지 1',
                    owner='홍길동',
                    address='경기도 화성시',
                    crop_type='사과',
                    area=5000.0,
                    center_lat=37.2,
                    center_lng=127.0,
                    boundary=[
                        [37.199, 126.999],
                        [37.201, 126.999],
                        [37.201, 127.001],
                        [37.199, 127.001]
                    ],
                    notes='테스트용 필지입니다.'
                ),
                Field(
                    name='동쪽 과수원',
                    owner='김철수',
                    address='경기도 평택시',
                    crop_type='배',
                    area=8500.0,
                    center_lat=37.0,
                    center_lng=127.1,
                    boundary=[
                        [36.999, 127.099],
                        [37.001, 127.099],
                        [37.001, 127.101],
                        [36.999, 127.101]
                    ],
                    notes='배 재배 과수원'
                ),
                Field(
                    name='서쪽 채소밭',
                    owner='이영희',
                    address='충청남도 천안시',
                    crop_type='배추',
                    area=12000.0,
                    center_lat=36.8,
                    center_lng=127.15,
                    boundary=[
                        [36.799, 127.149],
                        [36.801, 127.149],
                        [36.801, 127.151],
                        [36.799, 127.151]
                    ],
                    notes='배추 재배지'
                )
            ]

            for field in test_fields:
                db.session.add(field)

            db.session.commit()
            print(f"  ✓ {len(test_fields)}개의 테스트 필지가 생성되었습니다.")

    # 3. 테스트 방제 계획 데이터 생성
    print("\n[3/3] 테스트 방제 계획 데이터 생성")
    response = input("테스트 방제 계획을 생성하시겠습니까? (y/n) [y]: ").strip().lower()

    if response in ['', 'y', 'yes']:
        from models.field import Field
        from models.spray_plan import SprayPlan
        from datetime import date, timedelta

        with app.app_context():
            fields = Field.query.all()

            if not fields:
                print("  ⚠ 필지가 없습니다. 먼저 필지를 생성해주세요.")
            else:
                # 기존 계획 확인
                existing_count = SprayPlan.query.count()
                if existing_count > 0:
                    print(f"  이미 {existing_count}개의 방제 계획이 존재합니다.")
                    overwrite = input("  기존 데이터를 삭제하고 새로 생성하시겠습니까? (y/n) [n]: ").strip().lower()
                    if overwrite in ['y', 'yes']:
                        SprayPlan.query.delete()
                        db.session.commit()
                    else:
                        print("  기존 데이터를 유지합니다.")
                        print("\n" + "=" * 60)
                        print("설정이 완료되었습니다!")
                        print("=" * 60)
                        print("\n애플리케이션을 실행하려면:")
                        print("  python app.py")
                        print("\n브라우저에서 http://localhost:5000 접속")
                        return

                today = date.today()

                test_plans = [
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

                for plan in test_plans:
                    db.session.add(plan)

                db.session.commit()
                print(f"  ✓ {len(test_plans)}개의 테스트 방제 계획이 생성되었습니다.")

    # 완료 메시지
    print("\n" + "=" * 60)
    print("설정이 완료되었습니다!")
    print("=" * 60)

    with app.app_context():
        field_count = Field.query.count()
        plan_count = SprayPlan.query.count()
        print(f"\n생성된 데이터:")
        print(f"  - 필지: {field_count}개")
        print(f"  - 방제 계획: {plan_count}개")

    print("\n애플리케이션을 실행하려면:")
    print("  python app.py")
    print("\n브라우저에서 http://localhost:5000 접속")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n설정이 취소되었습니다.")
        sys.exit(1)
    except Exception as e:
        print(f"\n⚠ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
