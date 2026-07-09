import { safeParseContent } from "./parse";

describe("safeParseContent (LLM 응답 파싱)", () => {
  test("순수 JSON을 파싱한다", () => {
    const c = `{"region":"제주","days":[],"estCostKrw":50000,"summary":"x"}`;
    expect(safeParseContent(c)).toBeTruthy();
  });

  test("```json 코드펜스를 제거한다", () => {
    const c = "```json\n{\"region\":\"제주\",\"days\":[],\"estCostKrw\":1,\"summary\":\"x\"}\n```";
    const r = safeParseContent(c) as any;
    expect(r.region).toBe("제주");
  });

  test("``` 코드펜스(언어명 없음)를 제거한다", () => {
    const c = "```\n{\"region\":\"서울\",\"days\":[],\"estCostKrw\":1,\"summary\":\"x\"}\n```";
    const r = safeParseContent(c) as any;
    expect(r.region).toBe("서울");
  });

  test("앞뒤 설명 텍스트가 붙어있어도 JSON을 추출한다", () => {
    const c = "네, 코스입니다:\n{\"region\":\"부산\",\"days\":[],\"estCostKrw\":2,\"summary\":\"x\"}\n위와 같이 구성했습니다.";
    const r = safeParseContent(c) as any;
    expect(r.region).toBe("부산");
  });

  test("JSON이 아니면 null을 반환한다", () => {
    expect(safeParseContent("안녕하세요 코스는 없습니다")).toBeNull();
  });
});
