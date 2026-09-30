// HTML 문자열로만 내용을 받는 외부 SDK(카카오맵 InfoWindow 등)에 텍스트를 넣을 때 쓴다.
// 장소명은 카카오·tourAPI 응답이라 우리가 통제하지 않는다 — 그대로 끼우면 마크업으로 해석된다.
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
