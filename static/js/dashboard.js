// ZooDrone 대시보드 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();

        if (result.success) {
            const data = result.data;

            // 통계 업데이트
            document.getElementById('totalFields').textContent = data.total_fields || 0;
            document.getElementById('plansThisWeek').textContent = data.plans_this_week || 0;
            document.getElementById('completedThisWeek').textContent = data.completed_this_week || 0;
            document.getElementById('monthlyArea').textContent = Math.round(data.monthly_area) || 0;

            // 오늘의 일정
            displayTodayPlans(data.today_plans);

            // 최근 작업 이력
            displayRecentHistories(data.recent_histories);
        }
    } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
    }
}

function displayTodayPlans(plans) {
    const container = document.getElementById('todayPlans');

    if (!plans || plans.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">오늘 예정된 방제 작업이 없습니다.</p>';
        return;
    }

    let html = '<div class="list-group">';
    plans.forEach(plan => {
        const statusBadge = getStatusBadge(plan.status);
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${plan.field_name || '알 수 없음'}</h6>
                        <small class="text-muted">농약: ${plan.pesticide_name}</small>
                    </div>
                    ${statusBadge}
                </div>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

function displayRecentHistories(histories) {
    const container = document.getElementById('recentHistories');

    if (!histories || histories.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">최근 작업 이력이 없습니다.</p>';
        return;
    }

    let html = '<div class="list-group">';
    histories.forEach(history => {
        const date = new Date(history.actual_date);
        const dateStr = date.toLocaleDateString('ko-KR');

        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${history.field_name || '알 수 없음'}</h6>
                        <small class="text-muted">
                            ${dateStr} | ${history.operator}
                        </small>
                    </div>
                    <span class="badge bg-success">완료</span>
                </div>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

function getStatusBadge(status) {
    const badges = {
        'scheduled': '<span class="badge bg-primary">예정</span>',
        'completed': '<span class="badge bg-success">완료</span>',
        'cancelled': '<span class="badge bg-danger">취소</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">알 수 없음</span>';
}
