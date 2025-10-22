# ZooDrone - 드론 방제 관리 시스템

농업용 드론 방제 작업을 효율적으로 관리하는 웹 기반 시스템

## 🚀 빠른 시작 (Quick Start)

```bash
# 1. 저장소 클론
git clone <repository-url>
cd zoodrone

# 2. 의존성 설치
pip install -r requirements.txt

# 3. 초기 설정 (데이터베이스 + 테스트 데이터)
python setup.py

# 4. 애플리케이션 실행
python app.py

# 브라우저에서 http://localhost:5000 접속
```

## 기능

- **필지 관리**: 지도 기반 필지 등록 및 관리
- **방제 계획**: 일정 관리 및 농약 살포 계획 수립
- **비행 경로**: 자동 비행 경로 생성 및 최적화
- **작업 이력**: 방제 작업 기록 및 사진 관리
- **대시보드**: 통계 및 일정 요약
- **보고서**: 기간별 작업 내역 및 비용 분석

## 기술 스택

### 백엔드
- Python 3.10+
- Flask 3.0+
- SQLAlchemy (ORM)
- SQLite (데이터베이스)

### 프론트엔드
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Leaflet.js (지도)
- Chart.js (차트)

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd zoodrone
```

### 2. 가상환경 생성 (선택)
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3. 의존성 설치
```bash
pip install -r requirements.txt
```

### 4. 환경 변수 설정
`.env.example`을 `.env`로 복사하고 필요한 값을 설정합니다.

```bash
cp .env.example .env
```

### 5. 초기 설정 (권장)

**한 번에 설정하기:**
```bash
python setup.py
```

이 스크립트는 다음을 수행합니다:
- 데이터베이스 생성
- 테스트 필지 생성 (선택 가능)
- 테스트 방제 계획 생성 (선택 가능)

**또는 수동으로 설정하기:**
```bash
# 데이터베이스만 생성
python init_db.py

# 테스트 데이터 생성 (선택사항)
python test_fields.py   # 3개의 테스트 필지 생성
python test_plans.py    # 6개의 방제 계획 생성
```

### 6. 애플리케이션 실행

**간편 실행 (권장):**
```bash
# Linux/macOS
./run.sh

# Windows
run.bat
```

**또는 직접 실행:**
```bash
python app.py
```

브라우저에서 `http://localhost:5000` 접속

## 빠른 시작 가이드

### 첫 번째 필지 등록하기

1. 브라우저에서 http://localhost:5000 접속
2. 상단 메뉴에서 **필지 관리** 클릭
3. 우측 상단 **필지 추가** 버튼 클릭
4. 필지 정보 입력:
   - 필지명: 예) 동쪽 과수원
   - 소유주: 예) 홍길동
   - 주소: 예) 경기도 화성시...
   - 작물 종류: 예) 사과
   - 면적: 예) 5000 (㎡)
5. **경계선 그리기** 버튼 클릭 후 지도에서 클릭하여 경계선 표시
6. **저장** 버튼 클릭

### 방제 계획 등록하기

1. 상단 메뉴에서 **방제 계획** 클릭
2. 우측 상단 **계획 추가** 버튼 클릭
3. 계획 정보 입력:
   - 필지 선택 (자동으로 권장 살포량이 계산됩니다)
   - 예정일: 방제 예정 날짜
   - 농약명: 예) 다이센엠-45
   - 살포량: 자동 계산된 값 또는 직접 입력
   - 대상 병해충: 예) 노균병
   - 비고: 특이사항
4. **저장** 버튼 클릭

### 주요 기능

#### 필지 관리
- **검색**: 필지명, 소유주, 작물로 실시간 검색
- **지도 표시**: 필지 클릭 시 지도에 경계선 표시
- **편집**: 각 필지의 편집 버튼으로 정보 수정
- **삭제**: 삭제 버튼으로 필지 제거 (관련 계획도 함께 삭제됨)

#### 방제 계획 관리
- **자동 계산**: 필지 선택 시 면적 기준 살포량 자동 계산 (1,000㎡당 10L)
- **D-day 표시**: 예정일까지 남은 일수 자동 계산
- **상태 관리**: 예정 → 완료/취소 상태 변경
- **검색 및 필터**: 필지명, 농약명 검색 및 상태별 필터링

## 프로젝트 구조

```
zoodrone/
├── app.py                  # Flask 앱 엔트리포인트
├── config.py               # 설정 파일
├── requirements.txt        # Python 의존성
├── models/                 # 데이터 모델
├── routes/                 # API 라우트
├── utils/                  # 유틸리티 함수
├── static/                 # 정적 파일 (CSS, JS)
├── templates/              # HTML 템플릿
└── data/                   # 데이터베이스 및 업로드 파일
```

## API 엔드포인트

### 필지 관리
- `GET /api/fields` - 모든 필지 조회
- `GET /api/fields/:id` - 특정 필지 조회
- `POST /api/fields` - 필지 생성
- `PUT /api/fields/:id` - 필지 수정
- `DELETE /api/fields/:id` - 필지 삭제

### 방제 계획
- `GET /api/plans` - 모든 계획 조회
- `POST /api/plans` - 계획 생성
- `PUT /api/plans/:id` - 계획 수정
- `DELETE /api/plans/:id` - 계획 삭제

### 비행 경로
- `GET /api/paths` - 모든 경로 조회
- `POST /api/paths/generate` - 경로 생성
- `GET /api/paths/:id/download` - 경로 다운로드

### 작업 이력
- `GET /api/history` - 모든 이력 조회
- `POST /api/history` - 이력 생성
- `POST /api/history/:id/photos` - 사진 업로드

## 개발 로드맵

- [x] Phase 1: 기본 인프라 구축
- [x] Phase 2: 필지 관리 기능 완성
- [x] Phase 3: 방제 계획 관리 완성
- [ ] Phase 4: 비행 경로 생성
- [ ] Phase 5: 작업 이력
- [ ] Phase 6: 대시보드 & 보고서
- [ ] Phase 7: 최적화 및 마무리

## 라이선스

MIT License

## 작성자

ZooDrone Project Team

## 버전

1.0.0
