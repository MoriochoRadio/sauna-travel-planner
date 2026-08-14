# 정적판·풀스택 플래너 데이터 경계

**작성일:** 2026-08-14  
**목적:** GitHub Pages 정적판과 로그인 기반 풀스택 원본을 혼동 없이 함께 관리한다.

## 서비스별 저장 원칙

| 구분 | GitHub Pages 정적판 | 풀스택 원본 |
| --- | --- | --- |
| 저장 위치 | 사용자의 현재 브라우저 `localStorage` | 로그인 사용자별 데이터베이스 |
| 플랜 식별 | 없음 — 브라우저 단일 목록 | `tripPlans.id`, `userId` |
| 장소 항목 | `id`, `note`, 목록 순서 | `placeId`, `position`, `startTime`, `estimatedCost`, `durationMinutes`, `note` |
| 메모 최대 길이 | 240자 | 240자 |
| 일정·예산·체크리스트 | 제공하지 않음 | 제공 |
| 공유·관리자 운영 | 제공하지 않음 | 공유 토큰, 관리 상태·메모 제공 |

정적판은 서버 요청, 계정, 쿠키 또는 공유 토큰을 만들지 않는다. 사용자가 복사한 복원 코드는 동일하거나 다른 브라우저의 **정적판**에서만 복원하는 백업 수단이며, 풀스택 계정이나 데이터베이스로 자동 전송되지 않는다.

## 정적판 일정 형식

정적판은 아래 두 형식을 읽는다. 출력은 현재 형식인 v2로 고정한다.

```json
// v1 — 기존 백업, 계속 복원 가능
{"version":1,"placeIds":["spaland","deokgu"]}

// v2 — 현재 출력 형식
{"version":2,"items":[{"id":"spaland","note":"오후 이용"}]}
```

| 처리 규칙 | 동작 |
| --- | --- |
| 미등록 장소 ID | 복원 시 제외 |
| 중복 장소 ID | 먼저 나온 항목만 유지 |
| 손상 JSON | 기존 브라우저 목록을 덮어쓰지 않고 오류 안내 |
| 메모 | 문자열만 수용하고 240자로 제한 |
| 순서 | v2 `items` 배열 순서를 보존 |

## 장소 데이터 경계

정적판의 6개 장소 카탈로그는 서버가 없는 단일 HTML에서 즉시 렌더링해야 하므로 `shared/travelCatalog.ts`를 런타임에 직접 읽지 않는다. 따라서 다음 필드는 변경 시 두 경로를 함께 검토한다.

| 데이터 | 풀스택 원본 | 정적판 원본 | 배포 전 확인 |
| --- | --- | --- |
| 이름·지역·소개 | `shared/travelCatalog.ts` / `places` | `client/public/github-pages/index.html` | 장소 ID·공식 URL·표현 일치 |
| 검증 상태·확인일 | `placeVerificationRecords`, 카탈로그 검증 필드 | `status`, `verifiedAt` | 상태 용어 매핑과 날짜 확인 |
| 출처·방문 전 확인 | 카탈로그 `sourceLabel`, `operatingNote` | `sourceLabel`, `operatingNote` | 카드 문맥·공식 링크 확인 |

정적판의 `official`은 공개적으로 연결한 공식 정보 확인을 뜻하고, 풀스택 DB의 `verified`와 동의어로 간주하지 않는다. 운영자가 DB 상태를 바꿔도 정적판은 자동 갱신되지 않으며, 검증 후 정적 HTML을 별도 배포해야 한다.

## 구현된 로그인 플랜 이관

로그인 사용자는 **나의 여행** 화면에서 GitHub Pages가 만든 v2 복원 코드를 붙여넣어 새 플랜을 만들 수 있다. 이 작업은 기존 플랜을 수정하지 않으며, 서버의 `travel.planner.importStatic` 보호 절차가 현재 로그인한 사용자 ID만 사용해 새 플랜과 정차 항목을 생성한다.

| 정적판 ID | 풀스택 정식 ID |
| --- | --- |
| `spaland` | `spaland-centum-city` |
| `hurshimchung` | `hurshimchung` |
| `aquafield` | `aquafield-goyang` |
| `dogo` | `asan-spavis` |
| `deokgu` | `deokgu-onsen-resort` |
| `osak` | `osack-greenyard` |

서버는 최대 12개 항목만 수용하고, 정식 ID로 변환할 수 없는 항목과 중복 장소를 제외한다. 남은 항목이 없으면 새 플랜을 만들지 않는다. 서버는 각 메모를 240자로 제한하고, 첫 유효 장소를 커버로 사용하며, 여러 지역이면 플랜 지역을 `여러 지역`으로 설정한다. 플랜 생성과 정차 추가는 하나의 데이터베이스 트랜잭션으로 처리한다.

브라우저에서 만든 복원 코드는 신뢰할 수 없는 입력으로 취급한다. 코드에 포함된 사용자 ID·관리 상태·공유 토큰·예산·일정 시간 값은 읽지 않으며, 사용자는 자신의 계정에만 새 플랜을 만들 수 있다.
