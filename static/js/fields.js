// ZooDrone 필지 관리 JavaScript

let map;
let currentMarker = null;
let currentPolygon = null;
let drawingMode = false;
let polygonPoints = [];

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadFields();
});

function initMap() {
    // 지도 초기화 (대한민국 중심)
    map = L.map('map').setView([37.5665, 126.9780], 7);

    // OpenStreetMap 타일 레이어
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // 지도 클릭 이벤트
    map.on('click', function(e) {
        if (!drawingMode) {
            setMapCenter(e.latlng.lat, e.latlng.lng);
        } else {
            addPolygonPoint(e.latlng);
        }
    });
}

function setMapCenter(lat, lng) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    currentMarker = L.marker([lat, lng]).addTo(map);
}

function addPolygonPoint(latlng) {
    polygonPoints.push([latlng.lat, latlng.lng]);

    if (currentPolygon) {
        map.removeLayer(currentPolygon);
    }

    currentPolygon = L.polygon(polygonPoints, {color: 'blue'}).addTo(map);
}

async function loadFields() {
    try {
        const response = await fetch('/api/fields');
        const result = await response.json();

        if (result.success) {
            displayFields(result.data);
        }
    } catch (error) {
        console.error('필지 데이터 로드 실패:', error);
    }
}

function displayFields(fields) {
    const container = document.getElementById('fieldsList');

    if (!fields || fields.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">등록된 필지가 없습니다.</p>';
        return;
    }

    let html = '';
    fields.forEach(field => {
        html += `
            <div class="card mb-2">
                <div class="card-body">
                    <h6 class="card-title">${field.name}</h6>
                    <p class="card-text small mb-2">
                        <strong>소유주:</strong> ${field.owner}<br>
                        <strong>작물:</strong> ${field.crop_type || '-'}<br>
                        <strong>면적:</strong> ${field.area} ㎡
                    </p>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewField('${field.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="editField('${field.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteField('${field.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // 지도에 필지 표시
    fields.forEach(field => {
        if (field.boundary && field.boundary.length > 0) {
            L.polygon(field.boundary, {color: 'green'})
                .addTo(map)
                .bindPopup(`<strong>${field.name}</strong><br>${field.area} ㎡`);
        }
    });
}

async function saveField() {
    const id = document.getElementById('fieldId').value;
    const name = document.getElementById('fieldName').value;
    const owner = document.getElementById('fieldOwner').value;
    const address = document.getElementById('fieldAddress').value;
    const cropType = document.getElementById('fieldCropType').value;
    const area = parseFloat(document.getElementById('fieldArea').value);
    const notes = document.getElementById('fieldNotes').value;

    if (!name || !owner || !area) {
        alert('필수 항목을 입력해주세요.');
        return;
    }

    const data = {
        name,
        owner,
        address,
        crop_type: cropType,
        area,
        center_lat: currentMarker ? currentMarker.getLatLng().lat : 37.5665,
        center_lng: currentMarker ? currentMarker.getLatLng().lng : 126.9780,
        boundary: polygonPoints.length > 0 ? polygonPoints : null,
        notes
    };

    try {
        const url = id ? `/api/fields/${id}` : '/api/fields';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            bootstrap.Modal.getInstance(document.getElementById('fieldModal')).hide();
            loadFields();
        } else {
            alert('오류: ' + result.error);
        }
    } catch (error) {
        console.error('필지 저장 실패:', error);
        alert('필지 저장 중 오류가 발생했습니다.');
    }
}

function viewField(id) {
    // TODO: 필지 상세 보기 구현
    console.log('View field:', id);
}

function editField(id) {
    // TODO: 필지 수정 구현
    console.log('Edit field:', id);
}

async function deleteField(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/fields/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadFields();
        }
    } catch (error) {
        console.error('필지 삭제 실패:', error);
    }
}
