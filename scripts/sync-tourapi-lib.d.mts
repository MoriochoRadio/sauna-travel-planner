// sync-tourapi-lib.mjs 타입 선언 (테스트에서 import할 때 tsc --noEmit가 쓰는 용도)
export interface SyncRegion {
  id: string;
  sido: string[];
  signgu?: string;
  cities?: string[];
  excludeCities?: string[];
}
export interface Anchor { name: string; lat: number; lng: number }
export interface RegionQuery { lDongRegnCd: string; lDongSignguCd?: string; sidoName: string }

export const GWANGJU_GU: string[];
export const REGIONS: SyncRegion[];
export const FALLBACK_SIDO_CODES: Record<string, string>;
export const KOREA_BOUNDS: { minLat: number; maxLat: number; minLng: number; maxLng: number };
export const DEFAULT_RADIUS_KM: number;
export const REGION_RADIUS_KM: Record<string, number>;
export const EXTRA_ANCHORS: Record<string, Anchor[]>;

export function cityOf(addr: string | undefined): string | undefined;
export function acceptsCity(region: SyncRegion, addr: string | undefined): boolean;
export function resolveRegionQueries(
  sidoList: { code: string; name: string }[],
  regions?: SyncRegion[],
): { queries: Record<string, RegionQuery>; missing: string[] };
export function parseAnchors(src: string): Record<string, Anchor[]>;
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number;
export function coordProblem(
  lat: number | undefined,
  lng: number | undefined,
  regionId: string,
  anchors: Record<string, Anchor[]> | undefined,
): string | null;
