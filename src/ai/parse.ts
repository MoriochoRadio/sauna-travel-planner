// LLM 응답 파싱 헬퍼 — 마크다운 코드펜스/주석이 섞인 응답도 JSON으로 복원
export function safeParseContent(content: string): unknown | null {
  const trimmed = content.trim();
  // 1) 순수 JSON 시도
  try {
    return JSON.parse(trimmed);
  } catch { /* fallthrough */ }

  // 2) ```json ... ``` 또는 ``` ... ``` 제거
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(fenced);
  } catch { /* fallthrough */ }

  // 3) 첫 { 부터 마지막 } 추출
  const m = trimmed.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch { /* fallthrough */ }
  }
  return null;
}
