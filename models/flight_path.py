"""
비행 경로(FlightPath) 데이터 모델
"""
from datetime import datetime
import uuid
from database import db


class FlightPath(db.Model):
    """비행 경로 모델"""
    __tablename__ = 'flight_paths'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    field_id = db.Column(db.String(36), db.ForeignKey('fields.id'), nullable=False, comment='필지 ID')
    spray_plan_id = db.Column(db.String(36), db.ForeignKey('spray_plans.id'), comment='방제 계획 ID')
    path_data = db.Column(db.JSON, nullable=False, comment='경로 좌표 배열')
    spacing = db.Column(db.Float, nullable=False, default=5.0, comment='경로 간격(미터)')
    altitude = db.Column(db.Float, nullable=False, default=3.0, comment='비행 고도(미터)')
    total_distance = db.Column(db.Float, comment='총 비행 거리(미터)')
    estimated_time = db.Column(db.Integer, comment='예상 시간(분)')
    notes = db.Column(db.Text, comment='비고')
    created_at = db.Column(db.DateTime, default=lambda: datetime.utcnow(), comment='생성일시')

    # 관계 정의
    work_histories = db.relationship('WorkHistory', backref='flight_path', lazy=True)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'field_id': self.field_id,
            'field_name': self.field.name if self.field else None,
            'spray_plan_id': self.spray_plan_id,
            'path_data': self.path_data,
            'spacing': self.spacing,
            'altitude': self.altitude,
            'total_distance': self.total_distance,
            'estimated_time': self.estimated_time,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<FlightPath {self.field.name if self.field else "Unknown"} ({self.total_distance}m)>'
