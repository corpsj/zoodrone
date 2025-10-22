#!/bin/bash
# ZooDrone 실행 스크립트

echo "================================"
echo "ZooDrone 드론 방제 관리 시스템"
echo "================================"
echo ""

# 가상 환경 활성화 확인
if [ -d "venv" ]; then
    echo "가상 환경을 활성화합니다..."
    source venv/bin/activate
fi

# 데이터베이스 확인
if [ ! -f "data/zoodrone.db" ]; then
    echo "⚠ 데이터베이스가 없습니다."
    echo "초기 설정을 실행하려면:"
    echo "  python setup.py"
    echo ""
    read -p "지금 초기 설정을 실행하시겠습니까? (y/n) [y]: " response
    response=${response:-y}
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        python setup.py
    else
        exit 1
    fi
fi

# Flask 앱 실행
echo ""
echo "Flask 애플리케이션을 시작합니다..."
echo "브라우저에서 http://localhost:5000 접속"
echo "종료하려면 Ctrl+C를 누르세요"
echo ""

python app.py
