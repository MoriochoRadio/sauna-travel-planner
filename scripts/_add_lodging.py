import re
path = "src/data/seed.ts"
with open(path, encoding="utf-8") as f:
    c = f.read()

lodgings = {
  "seoul":   dict(id="seoul-lodging-01",   name="강남 온천 호텔(스파)",   city="서울 강남구",   sum="사우나 겸 온천 스파를 갖춘 도심 호텔", tags=["프리미엄","온천","야간"], hl=["노천 온천","사우나"], ons=True, sa=True),
  "busan":   dict(id="busan-lodging-01",   name="해운대 온천 리조트",     city="부산 해운대구", sum="바다 앞 노천온천을 갖춘 리조텔", tags=["해변","온천","가족"], hl=["노천탕","사우나"], ons=True, sa=True),
  "gangwon": dict(id="gangwon-lodging-01", name="평창 온천 콘도",         city="강원 평창군",   sum="슬로프 근처 온천 콘도, 사우나 완비", tags=["야외온천","설경","가족"], hl=["노천탕","한증막"], ons=True, sa=True),
  "gyeongju":dict(id="gyeongju-lodging-01",name="보문 온천 호텔",         city="경북 경주시",   sum="호수 앞 온천 호텔, 한식 레스토랑", tags=["온천","호수","프리미엄"], hl=["실내 온천","사우나"], ons=True, sa=True),
  "jeju":    dict(id="jeju-lodging-01",    name="제주 온천 풀빌라",       city="제주 제주시",   sum="개인 온천이 있는 풀빌라", tags=["온천","프리미엄","야외온천"], hl=["프라이빗 온천"], ons=True, sa=False),
  "incheon": dict(id="incheon-lodging-01", name="송도 온천 비즈니스 호텔",city="인천 송도구",   sum="사우나를 갖춘 비즈니스 호텔", tags=["가성비","사우나"], hl=["사우나","수면실"], ons=False, sa=True),
  "daejeon": dict(id="daejeon-lodging-01", name="유성 온천 호텔",         city="대전 유성구",   sum="유명 유성 온천을 갖춘 호텔", tags=["온천","보양"], hl=["노천 온천"], ons=True, sa=True),
  "gwangju": dict(id="gwangju-lodging-01", name="무등산 온천 호텔",       city="광주 동구",     sum="무등산 기슭 온천 호텔", tags=["온천","조용한"], hl=["실내 온천"], ons=True, sa=False),
  "daegu":   dict(id="daegu-lodging-01",   name="스파밸리 리조트",        city="대구 달서구",   sum="대규모 스파 리조트 숙박", tags=["야외온천","가족","프리미엄"], hl=["워터파크","사우나"], ons=True, sa=True),
}

region_order = ["seoul","busan","gangwon","gyeongju","jeju","incheon","daejeon","gwangju","daegu"]
parts = re.split(r'(places: mergeRegionPlaces\(\[)', c)
out = parts[0]
i = 1
rid_idx = 0
while i < len(parts):
    sep = parts[i]
    body = parts[i+1]
    rid = region_order[rid_idx]; rid_idx += 1
    L = lodgings[rid]
    line = (
        '      {{ id: "{0}", name: "{1}", type: "lodging", region: "{2}", '
        'city: "{3}", summary: "{4}", tags: {5}, priceLevel: "mid", '
        'avgDurationMin: 480, openHours: "24시간", highlights: {6}, '
        'source: "curated", hasOnsen: {7}, hasSauna: {8} }},\n'
    ).format(L["id"], L["name"], rid, L["city"], L["sum"], L["tags"], L["hl"],
             str(L["ons"]).lower(), str(L["sa"]).lower())
    out += sep + "\n" + line + body
    i += 2

with open(path, "w", encoding="utf-8") as f:
    f.write(out)
print("lodgings added")
