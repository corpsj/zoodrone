"""
방제 계획(SprayPlan) 데이터 모델
"""
from datetime import datetime
import uuid
from database import db


class SprayPlan(db.Model):
    """방제 계획 모델"""
    __tablename__ = 'spray_plans'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    field_id = db.Column(db.String(36), db.ForeignKey('fields.id'), nullable=False, comment='필지 ID')
    scheduled_date = db.Column(db.Date, nullable=False, comment='예정일')
    pesticide_name = db.Column(db.String(100), nullable=False, comment='농약명')
    pesticide_amount = db.Column(db.Float, nullable=False, comment='살포량(리터)')
    target_pest = db.Column(db.String(100), comment='대상 병해충')
    status = db.Column(
        db.String(20),
        nullable=False,
        default='scheduled',
        comment='상태: scheduled, completed, cancelled'
    )
    weather_condition = db.Column(db.JSON, comment='날씨 정보')
    notes = db.Column(db.Text, comment='비고')
    created_at = db.Column(db.DateTime, default=lambda: datetime.utcnow(), comment='생성일시')
    updated_at = db.Column(db.DateTime, default=lambda: datetime.utcnow(), onupdate=lambda: datetime.utcnow(), comment='수정일시')

    # 관계 정의
    work_histories = db.relationship('WorkHistory', backref='spray_plan', lazy=True)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'field_id': self.field_id,
            'field_name': self.field.name if self.field else None,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'pesticide_name': self.pesticide_name,
            'pesticide_amount': self.pesticide_amount,
            'target_pest': self.target_pest,
            'status': self.status,
            'weather_condition': self.weather_condition,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<SprayPlan {self.field.name if self.field else "Unknown"} on {self.scheduled_date}>'
