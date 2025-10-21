// ZooDrone 비행 경로 JavaScript

let map;
let currentField = null;
let currentPath = null;

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadFields();
});

function initMap() {
    map = L.map('map').setView([37.5665, 126.9780], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

async function loadFields() {
    try {
        const response = await fetch('/api/fields');
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('pathFieldId');
            select.innerHTML = '<option value="">필지를 선택하세요</option>';

            result.data.forEach(field => {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = `${field.name} (${field.area}㎡)`;
                option.dataset.field = JSON.stringify(field);
                select.appendChild(option);
            });

            // 필지 선택 이벤트
            select.addEventListener('change', function() {
                if (this.value) {
                    const field = JSON.parse(this.selectedOptions[0].dataset.field);
                    displayFieldOnMap(field);
                }
            });
        }
    } catch (error) {
        console.error('필지 목록 로드 실패:', error);
    }
}

function displayFieldOnMap(field) {
    currentField = field;

    // 지도 중심 이동
    map.setView([field.center_lat, field.center_lng], 16);

    // 기존 레이어 제거
    map.eachLayer(layer => {
        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // 필지 경계선 표시
    if (field.boundary && field.boundary.length > 0) {
        L.polygon(field.boundary, {color: 'green'})
            .addTo(map)
            .bindPopup(`<strong>${field.name}</strong><br>${field.area} ㎡`);
    }
}

async function generatePath() {
    if (!currentField) {
        alert('먼저 필지를 선택해주세요.');
        return;
    }

    const spacing = parseFloat(document.getElementById('pathSpacing').value);
    const altitude = parseFloat(document.getElementById('pathAltitude').value);

    if (!spacing || !altitude) {
        alert('경로 간격과 비행 고도를 입력해주세요.');
        return;
    }

    // TODO: 실제 경로 생성 알고리즘은 Phase 4에서 구현
    // 현재는 간단한 데모 경로 생성

    try {
        const response = await fetch('/api/paths/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                field_id: currentField.id,
                spacing,
                altitude,
                path_data: generateDemoPath(currentField),
                total_distance: 1000,
                estimated_time: 20
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('경로가 생성되었습니다!');
            displayPathOnMap(result.data);
        } else {
            alert('오류: ' + result.error);
        }
    } catch (error) {
        console.error('경로 생성 실패:', error);
        alert('경로 생성 중 오류가 발생했습니다.');
    }
}

function generateDemoPath(field) {
    // 간단한 데모 경로 (실제 알고리즘은 Phase 4에서 구현)
    if (!field.boundary || field.boundary.length < 3) {
        return [];
    }

    const boundary = field.boundary;
    const center = [field.center_lat, field.center_lng];

    // 중심을 기준으로 십자 경로 생성
    return [
        [center[0] - 0.001, center[1] - 0.001],
        [center[0] - 0.001, center[1] + 0.001],
        [center[0], center[1]],
        [center[0] + 0.001, center[1] - 0.001],
        [center[0] + 0.001, center[1] + 0.001]
    ];
}

function displayPathOnMap(pathData) {
    currentPath = pathData;

    // 경로 표시
    if (pathData.path_data && pathData.path_data.length > 0) {
        L.polyline(pathData.path_data, {
            color: 'red',
            weight: 3,
            dashArray: '5, 10'
        }).addTo(map);

        // 경로 정보 표시
        document.getElementById('pathInfo').classList.remove('d-none');
        document.getElementById('pathDistance').textContent = pathData.total_distance || 0;
        document.getElementById('pathTime').textContent = pathData.estimated_time || 0;
    }
}

async function downloadPath() {
    if (!currentPath) {
        alert('먼저 경로를 생성해주세요.');
        return;
    }

    try {
        const response = await fetch(`/api/paths/${currentPath.id}/download?format=json`);
        const result = await response.json();

        if (result.success) {
            // JSON 파일로 다운로드
            const dataStr = JSON.stringify(result.data, null, 2);
            const blob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `path_${currentPath.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('경로 다운로드 실패:', error);
    }
}
