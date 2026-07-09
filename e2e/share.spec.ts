import { test, expect } from "@playwright/test";

// 공유 URL(?region=daegu&days=2&prefs=premium) 진입 시 자동 생성
test("공유 URL로 진입하면 해당 설정으로 코스가 자동 생성된다", async ({ page }) => {
  await page.goto("/?region=daegu&days=2&prefs=premium");

  const heading = page.getByText(/대구 · 2일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });

  // 공유 버튼 표시
  await expect(page.getByRole("button", { name: /코스 공유 URL 복사/ })).toBeVisible();
});

test("지도 링크가 각 stop에 존재한다", async ({ page }) => {
  await page.goto("/?region=jeju&days=1");
  const heading = page.getByText(/제주 · 1일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });

  // 카카오맵 링크 확인
  const mapLink = page.locator('a[href^="https://map.kakao.com/?q="]').first();
  await expect(mapLink).toBeVisible();
});
