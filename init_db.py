#!/usr/bin/env python
"""
데이터베이스 초기화 스크립트
"""
from app import app, db

def init_database():
    """데이터베이스 초기화"""
    with app.app_context():
        # 모든 테이블 생성
        db.create_all()
        print("✓ Database tables created successfully!")

        # 테이블 목록 출력
        print("\nCreated tables:")
        for table in db.metadata.sorted_tables:
            print(f"  - {table.name}")

if __name__ == '__main__':
    init_database()
