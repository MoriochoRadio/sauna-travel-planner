# 카카오맵 SDK 연동 가이드

앱 내 지도 임베드(핀 + 정보창)를 활성화하려면 카카오맵 JavaScript 키가 필요합니다.
키가 없어도 장소 카드의 "카카오맵/네이버맵" 링크로 위치를 확인할 수 있습니다(자동 폴백).

## 1. 카카오 개발자 콘솔에서 앱 생성
1. https://developers.kakao.com 접속 → 로그인
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름: `sauna-travel-planner` 등 자유롭게

## 2. JavaScript 키 확인
- 앱 대시보드 → "앱 키" 탭 → **JavaScript 키** 복사
  (REST API 키가 아님 — JavaScript 키여야 함)

## 3. 플랫폼 등록 (도메인 허용)
- "플랫폼" → "Web" 추가
- 사이트 도메인:
  - `https://sauna-travel-planner-git-main-smaa04.vercel.app` (운영 배포)
  - `http://localhost:3000` (로컬 테스트)

## 4. Vercel 환경변수 등록
- Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
- Variable: `NEXT_PUBLIC_KAKAO_MAP_KEY`
- Value: 복사한 JavaScript 키
- Environment: Production (필요시 Preview/Development도)
- 저장 후 "Redeploy"

## 5. 확인
- 배포 후 사우나 맵 단계(Step 2)에서 지도가 표시되면 성공
- 핀 클릭 시 장소명 정보창, 선택한 사우나는 지도 중심으로 이동
