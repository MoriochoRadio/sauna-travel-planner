import type { PlannerInput, Preference } from "./schema";

// 코스 설정(PlannerInput)을 짧은 URL 쿼리로 직렬화/복원
const PREFS: Preference[] = ["quiet", "budget", "premium", "family", "solo", "outdoor_spa", "foodie"];

export function encodeInputToQuery(input: PlannerInput): string {
  const p = new URLSearchParams();
  p.set("region", input.region);
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
  const preferences = (prefsRaw ? prefsRaw.split(",") : [])
    .filter((x): x is Preference => (PREFS as string[]).includes(x));
  const note = p.get("note") ?? undefined;
  const anchorSaunaId = p.get("sauna") ?? undefined;
  const onsenFocus = p.get("onsen") === "1";
  const includeLodging = p.get("lodging") !== "0";
  return { region: region as PlannerInput["region"], days, preferences, note, anchorSaunaId, onsenFocus, includeLodging };
}

// 생성된 코스를 공유용 문자열로 압축 (날짜/지역/기간/취향 요약)
export function shareUrl(base: string, input: PlannerInput): string {
  return `${base}/?${encodeInputToQuery(input)}`;
}
