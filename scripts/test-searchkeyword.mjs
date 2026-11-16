// 검증용: tourAPI searchKeyword2 (지역+키워드 사우나) 실제 동작 확인
// 실행: TOURAPI_KEY=xxx node scripts/test-searchkeyword.mjs
// 런타임(src/lib/tourapi.ts)은 아직 areaCode로 검색한다. areaCode는 공식 문서에서 "미사용(삭제예정)"이라
// 같은 검색을 법정동 시도 코드(lDongRegnCd)로도 해서 건수를 나란히 남긴다 — 런타임 전환 여부 판단용.
const KEY = process.env.TOURAPI_KEY;
if (!KEY) { console.error("TOURAPI_KEY env 필요"); process.exit(1); }

async function search(regionParams, keyword) {
  const qs = new URLSearchParams({
    serviceKey: KEY, MobileOS: "ETC", MobileApp: "saunaplanner",
    _type: "json", numOfRows: "5", pageNo: "1",
    ...regionParams, keyword, listYN: "Y",
  });
  const res = await fetch(`https://apis.data.go.kr/B551011/KorService2/searchKeyword2?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const raw = json?.response?.body?.items?.item;
  const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  return { items: arr, total: Number(json?.response?.body?.totalCount ?? arr.length) };
}

// [areaCode, 법정동 시도 코드, 이름]
for (const [code, lDong, name] of [["1", "11", "서울"], ["6", "26", "부산"]]) {
  try {
    const { items, total } = await search({ areaCode: code }, "사우나");
    // 0건은 실패로 보지 않는다 — 이 API는 현재 0건을 계속 돌려주고, 런타임은 카카오/curated로 동작한다
    if (items.length === 0) console.log(`::warning::${name} searchKeyword2 → 0건 (tourAPI 사우나 키워드 검색 결과 없음)`);
    else console.log(`[OK] ${name} searchKeyword2 → ${items.length}건`);
    items.slice(0, 3).forEach((i) => console.log(`   - ${i.title} | ${i.addr1 ?? ""}`));
    const byLDong = await search({ lDongRegnCd: lDong }, "사우나");
    console.log(`   비교: ${name} 사우나 totalCount areaCode=${code} → ${total}건, lDongRegnCd=${lDong} → ${byLDong.total}건`);
  } catch (e) {
    console.error(`[FAIL] ${name}:`, e.message);
    process.exitCode = 1;
  }
}
console.log("searchKeyword2 검증 완료");
