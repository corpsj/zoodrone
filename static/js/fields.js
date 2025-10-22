// ZooDrone 필지 관리 JavaScript

let map;
let currentMarker = null;
let currentPolygon = null;
let drawingMode = false;
let polygonPoints = [];
let fieldLayers = {}; // 필지 레이어 관리
let currentFieldId = null; // 현재 편집 중인 필지 ID

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadFields();
    setupEventListeners();
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

function setupEventListeners() {
    // 모달이 닫힐 때 폼 및 지도 초기화
    const modal = document.getElementById('fieldModal');
    modal.addEventListener('hidden.bs.modal', function () {
        resetForm();
    });

    // 모달이 열릴 때 지도 리사이즈
    modal.addEventListener('shown.bs.modal', function () {
        setTimeout(() => map.invalidateSize(), 100);
    });
}

function setMapCenter(lat, lng) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    currentMarker = L.marker([lat, lng], {
        draggable: true
    }).addTo(map);

    // 마커 드래그 시 위치 업데이트
    currentMarker.on('dragend', function(e) {
        const position = e.target.getLatLng();
        console.log('마커 위치 변경:', position);
    });

    // 팝업 추가
    currentMarker.bindPopup('필지 중심점<br><small>드래그하여 위치 조정</small>').openPopup();
}

function toggleDrawingMode() {
    drawingMode = !drawingMode;
    const btn = document.getElementById('drawModeBtn');

    if (drawingMode) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-success');
        btn.innerHTML = '<i class="bi bi-check-circle"></i> 그리기 중 (클릭하여 완료)';
        showNotification('지도를 클릭하여 경계선을 그리세요', 'info');
    } else {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-secondary');
        btn.innerHTML = '<i class="bi bi-pencil"></i> 경계선 그리기';
        if (polygonPoints.length > 0) {
            showNotification(`경계선 완료 (${polygonPoints.length}개 점)`, 'success');
        }
    }
}

function clearPolygon() {
    if (currentPolygon) {
        map.removeLayer(currentPolygon);
        currentPolygon = null;
    }
    polygonPoints = [];
    drawingMode = false;
    const btn = document.getElementById('drawModeBtn');
    if (btn) {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-secondary');
        btn.innerHTML = '<i class="bi bi-pencil"></i> 경계선 그리기';
    }
    showNotification('경계선이 초기화되었습니다', 'info');
}

function addPolygonPoint(latlng) {
    polygonPoints.push([latlng.lat, latlng.lng]);

    if (currentPolygon) {
        map.removeLayer(currentPolygon);
    }

    currentPolygon = L.polygon(polygonPoints, {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.3
    }).addTo(map);

    // 마커 추가 (점 표시)
    L.circleMarker(latlng, {
        radius: 5,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 1
    }).addTo(map);
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
        showNotification('필지 데이터를 불러오는데 실패했습니다', 'danger');
    }
}

function displayFields(fields) {
    const container = document.getElementById('fieldsList');

    // 기존 레이어 제거
    Object.values(fieldLayers).forEach(layer => map.removeLayer(layer));
    fieldLayers = {};

    if (!fields || fields.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">등록된 필지가 없습니다.<br><small>지도를 클릭하여 필지를 추가하세요.</small></p>';
        return;
    }

    let html = '';
    fields.forEach(field => {
        html += `
            <div class="card mb-2 fade-in" id="field-card-${field.id}">
                <div class="card-body">
                    <h6 class="card-title d-flex justify-content-between align-items-center">
                        ${field.name}
                        <span class="badge bg-primary">${field.crop_type || '미지정'}</span>
                    </h6>
                    <p class="card-text small mb-2">
                        <i class="bi bi-person"></i> <strong>소유주:</strong> ${field.owner}<br>
                        <i class="bi bi-geo-alt"></i> <strong>주소:</strong> ${field.address || '-'}<br>
                        <i class="bi bi-bounding-box"></i> <strong>면적:</strong> ${field.area.toLocaleString()} ㎡
                    </p>
                    <div class="btn-group btn-group-sm w-100" role="group">
                        <button class="btn btn-outline-primary" onclick="viewField('${field.id}')" title="보기">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="editField('${field.id}')" title="수정">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="confirmDeleteField('${field.id}', '${field.name}')" title="삭제">
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
            const polygon = L.polygon(field.boundary, {
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(map);

            polygon.bindPopup(`
                <div class="popup-content">
                    <h6 class="mb-1">${field.name}</h6>
                    <small>
                        <strong>소유주:</strong> ${field.owner}<br>
                        <strong>작물:</strong> ${field.crop_type || '-'}<br>
                        <strong>면적:</strong> ${field.area.toLocaleString()} ㎡
                    </small>
                </div>
            `);

            // 클릭 시 해당 필지 보기
            polygon.on('click', function() {
                viewField(field.id);
            });

            fieldLayers[field.id] = polygon;
        }

        // 중심점 마커 추가
        if (field.center_lat && field.center_lng) {
            const marker = L.marker([field.center_lat, field.center_lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map);

            marker.bindPopup(`<strong>${field.name}</strong>`);
        }
    });
}

async function saveField() {
    const id = document.getElementById('fieldId').value;
    const name = document.getElementById('fieldName').value.trim();
    const owner = document.getElementById('fieldOwner').value.trim();
    const address = document.getElementById('fieldAddress').value.trim();
    const cropType = document.getElementById('fieldCropType').value.trim();
    const area = parseFloat(document.getElementById('fieldArea').value);
    const notes = document.getElementById('fieldNotes').value.trim();

    // 유효성 검사
    if (!name) {
        showNotification('필지명을 입력해주세요', 'warning');
        document.getElementById('fieldName').focus();
        return;
    }

    if (!owner) {
        showNotification('소유주를 입력해주세요', 'warning');
        document.getElementById('fieldOwner').focus();
        return;
    }

    if (!area || area <= 0) {
        showNotification('유효한 면적을 입력해주세요', 'warning');
        document.getElementById('fieldArea').focus();
        return;
    }

    if (!currentMarker) {
        showNotification('지도를 클릭하여 필지 위치를 지정해주세요', 'warning');
        return;
    }

    const data = {
        name,
        owner,
        address,
        crop_type: cropType,
        area,
        center_lat: currentMarker.getLatLng().lat,
        center_lng: currentMarker.getLatLng().lng,
        boundary: polygonPoints.length > 2 ? polygonPoints : null,
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
            showNotification(result.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('fieldModal'));
            modal.hide();
            resetForm();
            loadFields();
        } else {
            showNotification('오류: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('필지 저장 실패:', error);
        showNotification('필지 저장 중 오류가 발생했습니다', 'danger');
    }
}

function viewField(id) {
    // 필지 카드 하이라이트
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('border-primary');
    });
    const card = document.getElementById(`field-card-${id}`);
    if (card) {
        card.classList.add('border-primary');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 지도에서 필지 하이라이트
    const layer = fieldLayers[id];
    if (layer) {
        // 모든 레이어 스타일 초기화
        Object.values(fieldLayers).forEach(l => {
            l.setStyle({
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.2,
                weight: 2
            });
        });

        // 선택된 레이어 하이라이트
        layer.setStyle({
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.4,
            weight: 3
        });

        // 지도 중심 이동 및 줌
        const bounds = layer.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });

        // 팝업 열기
        layer.openPopup();
    }
}

async function editField(id) {
    try {
        const response = await fetch(`/api/fields/${id}`);
        const result = await response.json();

        if (result.success) {
            const field = result.data;

            // 폼에 데이터 채우기
            document.getElementById('fieldId').value = field.id;
            document.getElementById('fieldName').value = field.name;
            document.getElementById('fieldOwner').value = field.owner;
            document.getElementById('fieldAddress').value = field.address || '';
            document.getElementById('fieldCropType').value = field.crop_type || '';
            document.getElementById('fieldArea').value = field.area;
            document.getElementById('fieldNotes').value = field.notes || '';

            // 지도에 마커 표시
            if (field.center_lat && field.center_lng) {
                setMapCenter(field.center_lat, field.center_lng);
                map.setView([field.center_lat, field.center_lng], 15);
            }

            // 경계선 표시
            if (field.boundary && field.boundary.length > 0) {
                polygonPoints = field.boundary;
                currentPolygon = L.polygon(polygonPoints, {
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.3
                }).addTo(map);
            }

            currentFieldId = field.id;

            // 모달 타이틀 변경
            document.querySelector('#fieldModal .modal-title').textContent = '필지 수정';

            // 모달 열기
            const modal = new bootstrap.Modal(document.getElementById('fieldModal'));
            modal.show();
        }
    } catch (error) {
        console.error('필지 조회 실패:', error);
        showNotification('필지 정보를 불러오는데 실패했습니다', 'danger');
    }
}

function confirmDeleteField(id, name) {
    if (confirm(`"${name}" 필지를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        deleteField(id);
    }
}

async function deleteField(id) {
    try {
        const response = await fetch(`/api/fields/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            loadFields();
        } else {
            showNotification('삭제 실패: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('필지 삭제 실패:', error);
        showNotification('필지 삭제 중 오류가 발생했습니다', 'danger');
    }
}

function resetForm() {
    // 폼 초기화
    document.getElementById('fieldId').value = '';
    document.getElementById('fieldName').value = '';
    document.getElementById('fieldOwner').value = '';
    document.getElementById('fieldAddress').value = '';
    document.getElementById('fieldCropType').value = '';
    document.getElementById('fieldArea').value = '';
    document.getElementById('fieldNotes').value = '';

    // 지도 초기화
    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }

    if (currentPolygon) {
        map.removeLayer(currentPolygon);
        currentPolygon = null;
    }

    polygonPoints = [];
    drawingMode = false;
    currentFieldId = null;

    // 모달 타이틀 초기화
    document.querySelector('#fieldModal .modal-title').textContent = '필지 정보';

    // 그리기 버튼 초기화
    const btn = document.getElementById('drawModeBtn');
    if (btn) {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-secondary');
        btn.innerHTML = '<i class="bi bi-pencil"></i> 경계선 그리기';
    }
}

function showNotification(message, type = 'info') {
    // Bootstrap 알림 토스트 생성
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toastId = 'toast-' + Date.now();
    const bgClass = `bg-${type}`;

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // 토스트가 숨겨진 후 DOM에서 제거
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// 검색 기능
function searchFields() {
    const searchTerm = document.getElementById('searchField')?.value.toLowerCase();
    if (!searchTerm) {
        loadFields();
        return;
    }

    const cards = document.querySelectorAll('#fieldsList .card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}
