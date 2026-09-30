// 카카오 API 제공 기능 실증 (현재 키로 실제 호출)
// 실행: KAKAO_REST_KEY=xxx node scripts/test-kakao-capabilities.mjs
const KEY = process.env.KAKAO_REST_KEY;
if (!KEY) { console.error("KAKAO_REST_KEY env 필요 (키는 코드에 넣지 말고 환경변수로만 전달)"); process.exit(1); }
const x = 126.9045, y = 37.5602; // 서울 중구

const tests = [
  ["키워드 검색(사우나)", `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent("사우나")}&x=${x}&y=${y}&radius=10000&size=3`],
  ["카테고리 검색(CE7카페)", `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&x=${x}&y=${y}&radius=10000&size=3`],
  ["주소 검색", `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent("서울특별시 중구 세종대로 110")}`],
  ["좌표→주소(역지오코딩)", `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${x}&y=${y}`],
];

(async () => {
  for (const [label, url] of tests) {
    try {
      const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
      const j = await res.json();
      const docs = j.documents || [];
      console.log(`[${res.status}] ${label} → ${docs.length}건`);
      docs.slice(0, 2).forEach((d) =>
        console.log(`   - ${d.place_name || d.address_name || d.road_address || ""} | ${JSON.stringify(Object.keys(d)).slice(0, 120)}`)
      );
    } catch (e) {
      console.log(`[ERR] ${label}: ${e.message}`);
    }
  }
})();
