// ZooDrone 방제 계획 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadFields();
    loadPlans();
});

async function loadFields() {
    try {
        const response = await fetch('/api/fields');
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('planFieldId');
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
            displayPlans(result.data);
        }
    } catch (error) {
        console.error('방제 계획 로드 실패:', error);
    }
}

function displayPlans(plans) {
    const tbody = document.getElementById('plansList');

    if (!plans || plans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">등록된 방제 계획이 없습니다.</td></tr>';
        return;
    }

    let html = '';
    plans.forEach(plan => {
        const date = new Date(plan.scheduled_date);
        const dateStr = date.toLocaleDateString('ko-KR');
        const statusBadge = getStatusBadge(plan.status);

        html += `
            <tr>
                <td>${dateStr}</td>
                <td>${plan.field_name || '-'}</td>
                <td>${plan.pesticide_name}</td>
                <td>${plan.pesticide_amount}</td>
                <td>${plan.target_pest || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning" onclick="editPlan('${plan.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePlan('${plan.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

async function savePlan() {
    const id = document.getElementById('planId').value;
    const fieldId = document.getElementById('planFieldId').value;
    const scheduledDate = document.getElementById('planDate').value;
    const pesticideName = document.getElementById('planPesticide').value;
    const pesticideAmount = parseFloat(document.getElementById('planAmount').value);
    const targetPest = document.getElementById('planTarget').value;
    const notes = document.getElementById('planNotes').value;

    if (!fieldId || !scheduledDate || !pesticideName || !pesticideAmount) {
        alert('필수 항목을 입력해주세요.');
        return;
    }

    const data = {
        field_id: fieldId,
        scheduled_date: scheduledDate,
        pesticide_name: pesticideName,
        pesticide_amount: pesticideAmount,
        target_pest: targetPest,
        notes
    };

    try {
        const url = id ? `/api/plans/${id}` : '/api/plans';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            bootstrap.Modal.getInstance(document.getElementById('planModal')).hide();
            loadPlans();
        } else {
            alert('오류: ' + result.error);
        }
    } catch (error) {
        console.error('방제 계획 저장 실패:', error);
        alert('방제 계획 저장 중 오류가 발생했습니다.');
    }
}

function editPlan(id) {
    // TODO: 방제 계획 수정 구현
    console.log('Edit plan:', id);
}

async function deletePlan(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/plans/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadPlans();
        }
    } catch (error) {
        console.error('방제 계획 삭제 실패:', error);
    }
}

function getStatusBadge(status) {
    const badges = {
        'scheduled': '<span class="badge bg-primary">예정</span>',
        'completed': '<span class="badge bg-success">완료</span>',
        'cancelled': '<span class="badge bg-danger">취소</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">알 수 없음</span>';
}
