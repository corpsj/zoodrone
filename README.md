# ZooDrone - 드론 방제 관리 시스템

농업용 드론 방제 작업을 효율적으로 관리하는 웹 기반 시스템

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

### 5. 데이터베이스 초기화
애플리케이션 실행 시 자동으로 데이터베이스가 생성됩니다.

### 6. 애플리케이션 실행
```bash
python app.py
```

또는

```bash
flask run
```

브라우저에서 `http://localhost:5000` 접속

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

- [x] Phase 1: 기본 인프라
- [ ] Phase 2: 필지 관리
- [ ] Phase 3: 방제 계획
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
