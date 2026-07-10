// 검증용: tourAPI searchKeyword2 (지역+키워드 사우나) 실제 동작 확인
// 실행: TOURAPI_KEY=xxx node scripts/test-searchkeyword.mjs
const KEY = process.env.TOURAPI_KEY;
if (!KEY) { console.error("TOURAPI_KEY env 필요"); process.exit(1); }

async function search(areaCode, keyword) {
  const qs = new URLSearchParams({
    serviceKey: KEY, MobileOS: "ETC", MobileApp: "saunaplanner",
    _type: "json", numOfRows: "5", pageNo: "1",
    areaCode, keyword, listYN: "Y",
  });
  const res = await fetch(`https://apis.data.go.kr/B551011/KorService2/searchKeyword2?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const raw = json?.response?.body?.items?.item;
  const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  return arr;
}

for (const [code, name] of [["1", "서울"], ["6", "부산"]]) {
  try {
    const items = await search(code, "사우나");
    console.log(`[OK] ${name} searchKeyword2 → ${items.length}건`);
    items.slice(0, 3).forEach((i) => console.log(`   - ${i.title} | ${i.addr1 ?? ""}`));
  } catch (e) {
    console.error(`[FAIL] ${name}:`, e.message);
    process.exitCode = 1;
  }
}
console.log("searchKeyword2 검증 완료");
