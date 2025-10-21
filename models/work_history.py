"""
작업 이력(WorkHistory) 데이터 모델
"""
from datetime import datetime
import uuid
from database import db


class WorkHistory(db.Model):
    """작업 이력 모델"""
    __tablename__ = 'work_histories'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    spray_plan_id = db.Column(db.String(36), db.ForeignKey('spray_plans.id'), nullable=False, comment='방제 계획 ID')
    field_id = db.Column(db.String(36), db.ForeignKey('fields.id'), nullable=False, comment='필지 ID')
    flight_path_id = db.Column(db.String(36), db.ForeignKey('flight_paths.id'), comment='비행 경로 ID')
    actual_date = db.Column(db.DateTime, nullable=False, comment='실제 작업 일시')
    operator = db.Column(db.String(100), nullable=False, comment='작업자')
    drone_model = db.Column(db.String(100), comment='드론 모델')
    flight_time = db.Column(db.Integer, comment='비행 시간(분)')
    battery_used = db.Column(db.Integer, comment='배터리 사용량(%)')
    pesticide_used = db.Column(db.Float, comment='실제 살포량(리터)')
    weather_actual = db.Column(db.JSON, comment='실제 날씨')
    photos = db.Column(db.JSON, comment='사진 URL 배열')
    notes = db.Column(db.Text, comment='작업 메모')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='생성일시')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='수정일시')

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'spray_plan_id': self.spray_plan_id,
            'field_id': self.field_id,
            'field_name': self.field.name if self.field else None,
            'flight_path_id': self.flight_path_id,
            'actual_date': self.actual_date.isoformat() if self.actual_date else None,
            'operator': self.operator,
            'drone_model': self.drone_model,
            'flight_time': self.flight_time,
            'battery_used': self.battery_used,
            'pesticide_used': self.pesticide_used,
            'weather_actual': self.weather_actual,
            'photos': self.photos or [],
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<WorkHistory {self.field.name if self.field else "Unknown"} by {self.operator}>'
