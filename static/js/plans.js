// ZooDrone 방제 계획 JavaScript

let fieldsData = []; // 필지 데이터 캐시

document.addEventListener('DOMContentLoaded', function() {
    loadFields();
    loadPlans();
    setupEventListeners();
});

function setupEventListeners() {
    // 필지 선택 시 자동 계산
    const fieldSelect = document.getElementById('planFieldId');
    if (fieldSelect) {
        fieldSelect.addEventListener('change', onFieldSelect);
    }

    // 모달이 닫힐 때 폼 초기화
    const modal = document.getElementById('planModal');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', resetForm);
    }
}

async function loadFields() {
    try {
        const response = await fetch('/api/fields');
        const result = await response.json();

        if (result.success) {
            fieldsData = result.data;
            const select = document.getElementById('planFieldId');
            select.innerHTML = '<option value="">필지를 선택하세요</option>';

            result.data.forEach(field => {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = `${field.name} (${field.owner}, ${field.area.toLocaleString()}㎡)`;
                option.dataset.area = field.area;
                option.dataset.cropType = field.crop_type || '';
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('필지 목록 로드 실패:', error);
        showNotification('필지 목록을 불러오는데 실패했습니다', 'danger');
    }
}

function onFieldSelect(event) {
    const selectedOption = event.target.selectedOptions[0];
    if (!selectedOption || !selectedOption.value) {
        document.getElementById('fieldInfo').classList.add('d-none');
        return;
    }

    const area = parseFloat(selectedOption.dataset.area);
    const cropType = selectedOption.dataset.cropType;

    // 필지 정보 표시
    document.getElementById('fieldInfo').classList.remove('d-none');
    document.getElementById('fieldInfoText').textContent =
        `면적: ${area.toLocaleString()}㎡ | 작물: ${cropType || '미지정'}`;

    // 살포량 자동 계산 (1,000㎡당 10L 기준)
    const estimatedAmount = (area / 1000) * 10;
    document.getElementById('planAmount').value = estimatedAmount.toFixed(1);

    showNotification(`권장 살포량: ${estimatedAmount.toFixed(1)}L (면적 기준)`, 'info');
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
        showNotification('방제 계획을 불러오는데 실패했습니다', 'danger');
    }
}

function displayPlans(plans) {
    const tbody = document.getElementById('plansList');

    if (!plans || plans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">등록된 방제 계획이 없습니다.</td></tr>';
        return;
    }

    // 날짜순 정렬
    plans.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));

    let html = '';
    plans.forEach(plan => {
        const date = new Date(plan.scheduled_date);
        const dateStr = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
        const statusBadge = getStatusBadge(plan.status);

        // D-day 계산
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const planDate = new Date(date);
        planDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((planDate - today) / (1000 * 60 * 60 * 24));
        let dDayBadge = '';
        if (diffDays === 0) {
            dDayBadge = '<span class="badge bg-danger ms-1">오늘</span>';
        } else if (diffDays > 0 && diffDays <= 7) {
            dDayBadge = `<span class="badge bg-warning ms-1">D-${diffDays}</span>`;
        }

        html += `
            <tr class="${plan.status === 'completed' ? 'table-success' : ''}">
                <td>${dateStr}${dDayBadge}</td>
                <td><strong>${plan.field_name || '-'}</strong></td>
                <td>${plan.pesticide_name}</td>
                <td>${plan.pesticide_amount} L</td>
                <td>${plan.target_pest || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        ${plan.status === 'scheduled' ? `
                            <button class="btn btn-outline-success" onclick="changeStatus('${plan.id}', 'completed')" title="완료">
                                <i class="bi bi-check-circle"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-warning" onclick="editPlan('${plan.id}')" title="수정">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="confirmDeletePlan('${plan.id}', '${plan.field_name}')" title="삭제">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
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
    const pesticideName = document.getElementById('planPesticide').value.trim();
    const pesticideAmount = parseFloat(document.getElementById('planAmount').value);
    const targetPest = document.getElementById('planTarget').value.trim();
    const notes = document.getElementById('planNotes').value.trim();

    // 유효성 검사
    if (!fieldId) {
        showNotification('필지를 선택해주세요', 'warning');
        document.getElementById('planFieldId').focus();
        return;
    }

    if (!scheduledDate) {
        showNotification('예정일을 입력해주세요', 'warning');
        document.getElementById('planDate').focus();
        return;
    }

    if (!pesticideName) {
        showNotification('농약명을 입력해주세요', 'warning');
        document.getElementById('planPesticide').focus();
        return;
    }

    if (!pesticideAmount || pesticideAmount <= 0) {
        showNotification('유효한 살포량을 입력해주세요', 'warning');
        document.getElementById('planAmount').focus();
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
            showNotification(result.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('planModal'));
            modal.hide();
            resetForm();
            loadPlans();
        } else {
            showNotification('오류: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('방제 계획 저장 실패:', error);
        showNotification('방제 계획 저장 중 오류가 발생했습니다', 'danger');
    }
}

async function editPlan(id) {
    try {
        const response = await fetch(`/api/plans/${id}`);
        const result = await response.json();

        if (result.success) {
            const plan = result.data;

            // 폼에 데이터 채우기
            document.getElementById('planId').value = plan.id;
            document.getElementById('planFieldId').value = plan.field_id;
            document.getElementById('planDate').value = plan.scheduled_date;
            document.getElementById('planPesticide').value = plan.pesticide_name;
            document.getElementById('planAmount').value = plan.pesticide_amount;
            document.getElementById('planTarget').value = plan.target_pest || '';
            document.getElementById('planNotes').value = plan.notes || '';

            // 필지 정보 표시
            const fieldSelect = document.getElementById('planFieldId');
            const event = new Event('change');
            fieldSelect.dispatchEvent(event);

            // 모달 타이틀 변경
            document.querySelector('#planModal .modal-title').textContent = '방제 계획 수정';

            // 모달 열기
            const modal = new bootstrap.Modal(document.getElementById('planModal'));
            modal.show();
        }
    } catch (error) {
        console.error('방제 계획 조회 실패:', error);
        showNotification('방제 계획 정보를 불러오는데 실패했습니다', 'danger');
    }
}

async function changeStatus(id, newStatus) {
    const statusNames = {
        'scheduled': '예정',
        'completed': '완료',
        'cancelled': '취소'
    };

    if (!confirm(`상태를 "${statusNames[newStatus]}"로 변경하시겠습니까?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/plans/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('상태가 변경되었습니다', 'success');
            loadPlans();
        } else {
            showNotification('오류: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('상태 변경 실패:', error);
        showNotification('상태 변경 중 오류가 발생했습니다', 'danger');
    }
}

function confirmDeletePlan(id, fieldName) {
    if (confirm(`"${fieldName}" 필지의 방제 계획을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        deletePlan(id);
    }
}

async function deletePlan(id) {
    try {
        const response = await fetch(`/api/plans/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            loadPlans();
        } else {
            showNotification('삭제 실패: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('방제 계획 삭제 실패:', error);
        showNotification('방제 계획 삭제 중 오류가 발생했습니다', 'danger');
    }
}

function resetForm() {
    // 폼 초기화
    document.getElementById('planId').value = '';
    document.getElementById('planFieldId').value = '';
    document.getElementById('planDate').value = '';
    document.getElementById('planPesticide').value = '';
    document.getElementById('planAmount').value = '';
    document.getElementById('planTarget').value = '';
    document.getElementById('planNotes').value = '';

    // 필지 정보 숨기기
    document.getElementById('fieldInfo').classList.add('d-none');

    // 모달 타이틀 초기화
    document.querySelector('#planModal .modal-title').textContent = '방제 계획 등록';
}

function getStatusBadge(status) {
    const badges = {
        'scheduled': '<span class="badge bg-primary">예정</span>',
        'completed': '<span class="badge bg-success">완료</span>',
        'cancelled': '<span class="badge bg-danger">취소</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">알 수 없음</span>';
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
function searchPlans() {
    const searchTerm = document.getElementById('searchPlan')?.value.toLowerCase();
    if (!searchTerm) {
        loadPlans();
        return;
    }

    const rows = document.querySelectorAll('#plansList tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 필터 기능
function filterByStatus(status) {
    const rows = document.querySelectorAll('#plansList tr');
    rows.forEach(row => {
        if (!status || row.innerHTML.includes(getStatusBadge(status))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
