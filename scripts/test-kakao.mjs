// CI 검증: 카카오 로컬 검색 실제 동작 증명
// 실행: KAKAO_REST_KEY=xxx node scripts/test-kakao.mjs
const KEY = process.env.KAKAO_REST_KEY;
if (!KEY) { console.error("KAKAO_REST_KEY env 필요"); process.exit(1); }

// 서울 중구 좌표 (37.5602, 126.9045), 반경 10km
const tests = [
  ["사우나", "사우나", 126.9045, 37.5602, 10000],
  ["찜질방", "찜질방", 126.9045, 37.5602, 10000],
  ["온천", "온천", 126.9045, 37.5602, 10000],
];

let total = 0;
for (const [label, q, x, y, r] of tests) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&x=${x}&y=${y}&radius=${r}&size=5`;
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  const j = await res.json();
  const docs = j.documents || [];
  total += docs.length;
  console.log(`[OK] ${label} → ${docs.length}건`);
  docs.slice(0, 2).forEach((d) => console.log(`   - ${d.place_name} | ${d.address_name || d.road_address_name || ""}`));
}
if (total === 0) {
  console.error("[FAIL] 카카오 검색 0건 — 키/활성화 확인 필요");
  process.exit(1);
}
console.log(`카카오 로컬 검색 검증 완료 (총 ${total}건)`);
