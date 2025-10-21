"""
필지(Field) 데이터 모델
"""
from datetime import datetime
import uuid
from database import db


class Field(db.Model):
    """필지 정보 모델"""
    __tablename__ = 'fields'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, comment='필지명')
    owner = db.Column(db.String(100), nullable=False, comment='소유주')
    address = db.Column(db.String(200), comment='주소')
    crop_type = db.Column(db.String(50), comment='작물 종류')
    area = db.Column(db.Float, nullable=False, comment='면적(평방미터)')
    center_lat = db.Column(db.Float, nullable=False, comment='중심 위도')
    center_lng = db.Column(db.Float, nullable=False, comment='중심 경도')
    boundary = db.Column(db.JSON, comment='경계선 좌표 배열')
    notes = db.Column(db.Text, comment='비고')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='생성일시')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='수정일시')

    # 관계 정의
    spray_plans = db.relationship('SprayPlan', backref='field', lazy=True, cascade='all, delete-orphan')
    flight_paths = db.relationship('FlightPath', backref='field', lazy=True, cascade='all, delete-orphan')
    work_histories = db.relationship('WorkHistory', backref='field', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'name': self.name,
            'owner': self.owner,
            'address': self.address,
            'crop_type': self.crop_type,
            'area': self.area,
            'center_lat': self.center_lat,
            'center_lng': self.center_lng,
            'boundary': self.boundary,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Field {self.name} ({self.area}㎡)>'
