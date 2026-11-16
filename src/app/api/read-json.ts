// API 요청 본문을 크기 상한 안에서만 JSON으로 읽는다.
// zod 3.x는 큰 배열을 검증할 때 원소마다 오류 객체를 쌓아 메모리를 소진할 수 있다
// (GHSA-mrhx-c7xc-m3w5, 수정은 4.6.6에만 있음). 스키마에 상한을 둬도 v3는 원소 검증을 끝까지
// 돌기 때문에, 검증 전에 본문 크기 자체를 막는 것이 실제 방어선이다.
// 정상 PlannerInput은 특이사항 500자를 꽉 채워도 2KB 안팎이다.
export const MAX_BODY_BYTES = 8 * 1024;

export type ReadJsonResult =
  | { ok: true; body: unknown }
  | { ok: false; error: "payload_too_large" | "invalid_json"; status: 413 | 400 };

interface BodySource {
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
}

export async function readJsonWithLimit(req: BodySource, maxBytes = MAX_BODY_BYTES): Promise<ReadJsonResult> {
  const tooLarge = { ok: false, error: "payload_too_large", status: 413 } as const;
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return tooLarge;

  // content-length가 없거나 거짓일 수 있으니 실제로 읽은 바이트도 센다 (상한을 넘는 즉시 중단)
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (req.body) {
    const reader = req.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel().catch(() => {});
        return tooLarge;
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) { bytes.set(c, offset); offset += c.byteLength; }
  try {
    return { ok: true, body: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, error: "invalid_json", status: 400 };
  }
}
