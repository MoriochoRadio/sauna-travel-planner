import { NOTE_MAX, type PlannerInput, type Preference } from "./schema";

// 코스 설정(PlannerInput)을 짧은 URL 쿼리로 직렬화/복원
const PREFS: Preference[] = ["quiet", "budget", "premium", "family", "solo", "outdoor_spa", "foodie"];

export function encodeInputToQuery(input: PlannerInput): string {
  const p = new URLSearchParams();
  p.set("region", input.region);
  if (input.sigungu) p.set("sigungu", input.sigungu);
  p.set("days", String(input.days));
  if (input.preferences.length) p.set("prefs", input.preferences.join(","));
  if (input.note) p.set("note", input.note);
  if (input.anchorSaunaId) p.set("sauna", input.anchorSaunaId);
  if (input.onsenFocus) p.set("onsen", "1");
  if (!input.includeLodging) p.set("lodging", "0");
  return p.toString();
}

export function decodeInputFromQuery(qs: string): PlannerInput | null {
  const p = new URLSearchParams(qs);
  const region = p.get("region");
  const daysRaw = p.get("days");
  if (!region || !daysRaw) return null;
  const days = Number(daysRaw);
  if (!Number.isInteger(days) || days < 1 || days > 4) return null;
  const prefsRaw = p.get("prefs");
  // 중복은 한 번만 — 입력 스키마가 취향 개수에 상한을 두므로 "quiet,quiet,…" 링크도 열리게
  const preferences = [...new Set(prefsRaw ? prefsRaw.split(",") : [])]
    .filter((x): x is Preference => (PREFS as string[]).includes(x));
  // 입력 스키마 상한(NOTE_MAX)보다 긴 공유 링크도 열리도록 잘라서 복원한다 (폼 입력과 같은 처리)
  const note = p.get("note")?.slice(0, NOTE_MAX);
  const anchorSaunaId = p.get("sauna") ?? undefined;
  const onsenFocus = p.get("onsen") === "1";
  const includeLodging = p.get("lodging") !== "0";
  const sigungu = p.get("sigungu") ?? undefined;
  return { region: region as PlannerInput["region"], days, preferences, note, anchorSaunaId, onsenFocus, includeLodging, sigungu };
}

// 생성된 코스를 공유용 문자열로 압축 (날짜/지역/기간/취향 요약)
export function shareUrl(base: string, input: PlannerInput): string {
  return `${base}/?${encodeInputToQuery(input)}`;
}
