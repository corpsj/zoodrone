"""
필지 관리 API 라우트
"""
from flask import Blueprint, request, jsonify
from database import db
from models.field import Field

bp = Blueprint('fields', __name__, url_prefix='/api/fields')


@bp.route('', methods=['GET'])
def get_fields():
    """모든 필지 조회"""
    try:
        fields = Field.query.order_by(Field.created_at.desc()).all()
        return jsonify({
            'success': True,
            'data': [field.to_dict() for field in fields],
            'count': len(fields)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': '필지 목록을 불러오는데 실패했습니다.'}), 500


@bp.route('/<field_id>', methods=['GET'])
def get_field(field_id):
    """특정 필지 조회"""
    try:
        field = Field.query.get_or_404(field_id)
        return jsonify({
            'success': True,
            'data': field.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': '필지를 찾을 수 없습니다.'}), 404


@bp.route('', methods=['POST'])
def create_field():
    """필지 생성"""
    try:
        data = request.get_json()

        # 필수 필드 검증
        if not data.get('name'):
            return jsonify({'success': False, 'error': '필지명은 필수입니다.'}), 400
        if not data.get('owner'):
            return jsonify({'success': False, 'error': '소유주는 필수입니다.'}), 400
        if not data.get('area') or float(data.get('area', 0)) <= 0:
            return jsonify({'success': False, 'error': '유효한 면적을 입력해주세요.'}), 400
        if not data.get('center_lat') or not data.get('center_lng'):
            return jsonify({'success': False, 'error': '필지 위치는 필수입니다.'}), 400

        field = Field(
            name=data.get('name'),
            owner=data.get('owner'),
            address=data.get('address'),
            crop_type=data.get('crop_type'),
            area=float(data.get('area')),
            center_lat=float(data.get('center_lat')),
            center_lng=float(data.get('center_lng')),
            boundary=data.get('boundary'),
            notes=data.get('notes')
        )

        db.session.add(field)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': field.to_dict(),
            'message': '필지가 성공적으로 생성되었습니다.'
        }), 201
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '입력값 형식이 올바르지 않습니다.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '필지 생성 중 오류가 발생했습니다.'}), 500


@bp.route('/<field_id>', methods=['PUT'])
def update_field(field_id):
    """필지 수정"""
    try:
        field = Field.query.get_or_404(field_id)
        data = request.get_json()

        # 유효성 검사
        if 'name' in data and not data['name']:
            return jsonify({'success': False, 'error': '필지명은 필수입니다.'}), 400
        if 'owner' in data and not data['owner']:
            return jsonify({'success': False, 'error': '소유주는 필수입니다.'}), 400
        if 'area' in data and float(data.get('area', 0)) <= 0:
            return jsonify({'success': False, 'error': '유효한 면적을 입력해주세요.'}), 400

        # 수정 가능한 필드 업데이트
        if 'name' in data:
            field.name = data['name']
        if 'owner' in data:
            field.owner = data['owner']
        if 'address' in data:
            field.address = data['address']
        if 'crop_type' in data:
            field.crop_type = data['crop_type']
        if 'area' in data:
            field.area = float(data['area'])
        if 'center_lat' in data:
            field.center_lat = float(data['center_lat'])
        if 'center_lng' in data:
            field.center_lng = float(data['center_lng'])
        if 'boundary' in data:
            field.boundary = data['boundary']
        if 'notes' in data:
            field.notes = data['notes']

        db.session.commit()

        return jsonify({
            'success': True,
            'data': field.to_dict(),
            'message': '필지가 성공적으로 수정되었습니다.'
        })
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '입력값 형식이 올바르지 않습니다.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '필지 수정 중 오류가 발생했습니다.'}), 500


@bp.route('/<field_id>', methods=['DELETE'])
def delete_field(field_id):
    """필지 삭제"""
    try:
        field = Field.query.get_or_404(field_id)
        db.session.delete(field)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '필지가 성공적으로 삭제되었습니다.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': '필지 삭제 중 오류가 발생했습니다.'}), 500
