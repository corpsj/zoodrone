// ZooDrone 작업 이력 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadFields();
    loadPlans();
    loadHistory();
});

async function loadFields() {
    try {
        const response = await fetch('/api/fields');
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('historyFieldId');
            select.innerHTML = '<option value="">필지를 선택하세요</option>';

            result.data.forEach(field => {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = `${field.name} (${field.area}㎡)`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('필지 목록 로드 실패:', error);
    }
}

async function loadPlans() {
    try {
        const response = await fetch('/api/plans');
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('historyPlanId');
            select.innerHTML = '<option value="">계획을 선택하세요</option>';

            result.data.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.id;
                option.textContent = `${plan.field_name} - ${plan.pesticide_name}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('방제 계획 목록 로드 실패:', error);
    }
}

async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const result = await response.json();

        if (result.success) {
            displayHistory(result.data);
        }
    } catch (error) {
        console.error('작업 이력 로드 실패:', error);
    }
}

function displayHistory(histories) {
    const tbody = document.getElementById('historyList');

    if (!histories || histories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">등록된 작업 이력이 없습니다.</td></tr>';
        return;
    }

    let html = '';
    histories.forEach(history => {
        const date = new Date(history.actual_date);
        const dateStr = date.toLocaleString('ko-KR');

        html += `
            <tr>
                <td>${dateStr}</td>
                <td>${history.field_name || '-'}</td>
                <td>${history.operator}</td>
                <td>${history.drone_model || '-'}</td>
                <td>${history.flight_time || '-'} 분</td>
                <td>${history.pesticide_used || '-'} L</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewHistory('${history.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteHistory('${history.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

async function saveHistory() {
    const id = document.getElementById('historyId').value;
    const fieldId = document.getElementById('historyFieldId').value;
    const planId = document.getElementById('historyPlanId').value;
    const actualDate = document.getElementById('historyDate').value;
    const operator = document.getElementById('historyOperator').value;
    const droneModel = document.getElementById('historyDrone').value;
    const flightTime = parseInt(document.getElementById('historyFlightTime').value) || null;
    const batteryUsed = parseInt(document.getElementById('historyBattery').value) || null;
    const pesticideUsed = parseFloat(document.getElementById('historyPesticide').value) || null;
    const notes = document.getElementById('historyNotes').value;

    if (!fieldId || !planId || !actualDate || !operator) {
        alert('필수 항목을 입력해주세요.');
        return;
    }

    const data = {
        field_id: fieldId,
        spray_plan_id: planId,
        actual_date: actualDate,
        operator,
        drone_model: droneModel,
        flight_time: flightTime,
        battery_used: batteryUsed,
        pesticide_used: pesticideUsed,
        notes
    };

    try {
        const url = id ? `/api/history/${id}` : '/api/history';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            bootstrap.Modal.getInstance(document.getElementById('historyModal')).hide();
            loadHistory();

            // 방제 계획 상태를 '완료'로 업데이트
            if (!id) {
                updatePlanStatus(planId, 'completed');
            }
        } else {
            alert('오류: ' + result.error);
        }
    } catch (error) {
        console.error('작업 이력 저장 실패:', error);
        alert('작업 이력 저장 중 오류가 발생했습니다.');
    }
}

async function updatePlanStatus(planId, status) {
    try {
        await fetch(`/api/plans/${planId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status })
        });
    } catch (error) {
        console.error('방제 계획 상태 업데이트 실패:', error);
    }
}

function viewHistory(id) {
    // TODO: 작업 이력 상세 보기 구현
    console.log('View history:', id);
}

async function deleteHistory(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/history/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadHistory();
        }
    } catch (error) {
        console.error('작업 이력 삭제 실패:', error);
    }
}
