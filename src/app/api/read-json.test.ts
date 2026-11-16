import { describe, expect, test } from "vitest";
import { MAX_BODY_BYTES, readJsonWithLimit } from "./read-json";

function req(body: string, headers: Record<string, string> = {}, chunk = 1024) {
  const bytes = new TextEncoder().encode(body);
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      for (let i = 0; i < bytes.length; i += chunk) c.enqueue(bytes.slice(i, i + chunk));
      c.close();
    },
  });
  return { headers: { get: (h: string) => headers[h.toLowerCase()] ?? null }, body: stream };
}

describe("readJsonWithLimit", () => {
  test("상한 안의 JSON은 그대로 읽는다 (한글 포함)", async () => {
    const r = await readJsonWithLimit(req(JSON.stringify({ region: "busan", note: "조용한 곳" })));
    expect(r).toEqual({ ok: true, body: { region: "busan", note: "조용한 곳" } });
  });

  test("content-length가 상한을 넘으면 본문을 읽지 않고 413", async () => {
    const r = await readJsonWithLimit(req("{}", { "content-length": String(MAX_BODY_BYTES + 1) }));
    expect(r).toMatchObject({ ok: false, status: 413 });
  });

  test("content-length 없이 큰 배열을 보내도 읽는 도중 413 (zod 검증까지 가지 않음)", async () => {
    const huge = JSON.stringify({ region: "busan", days: 1, preferences: Array(100_000).fill("x") });
    const r = await readJsonWithLimit(req(huge));
    expect(r).toMatchObject({ ok: false, error: "payload_too_large", status: 413 });
  });

  test("JSON이 아니면 400", async () => {
    expect(await readJsonWithLimit(req("not json"))).toMatchObject({ ok: false, error: "invalid_json", status: 400 });
  });
});
