import { describe, expect, test } from "vitest";
import { rateLimit, clientIp } from "./rate-limit";

describe("rateLimit", () => {
  test("같은 IP가 윈도우 내 MAX_REQUESTS(10)회까지 허용", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(ip)).toBe(true);
    }
  });

  test("11회째는 차단된다", () => {
    const ip = "5.6.7.8";
    for (let i = 0; i < 10; i++) rateLimit(ip);
    expect(rateLimit(ip)).toBe(false);
  });

  test("다른 IP는 독립적으로 카운트된다", () => {
    expect(rateLimit("9.9.9.9")).toBe(true);
  });

  test("unknown IP는 항상 허용 (오탐 차단 방지)", () => {
    for (let i = 0; i < 20; i++) expect(rateLimit("unknown")).toBe(true);
  });
});

describe("clientIp", () => {
  test("x-vercel-forwarded-for 우선 사용", () => {
    const req = { headers: { get: (h: string) => (h === "x-vercel-forwarded-for" ? "9.9.9.9, 10.0.0.1" : null) } };
    expect(clientIp(req)).toBe("9.9.9.9");
  });

  test("x-real-ip 사용", () => {
    const req = { headers: { get: (h: string) => (h === "x-real-ip" ? "8.8.8.8" : null) } };
    expect(clientIp(req)).toBe("8.8.8.8");
  });

  test("x-forwarded-for는 마지막 hop 사용", () => {
    const req = { headers: { get: (h: string) => (h === "x-forwarded-for" ? "9.9.9.9, 10.0.0.1" : null) } };
    expect(clientIp(req)).toBe("10.0.0.1");
  });

  test("헤더 없으면 unknown", () => {
    const req = { headers: { get: () => null } };
    expect(clientIp(req)).toBe("unknown");
  });
});
