import { test, expect } from "@playwright/test";

// 사용자 플로우 E2E (3단계: 지역 → 사우나 고르기 → 부가옵션 → 코스)
test("지역 선택 → 사우나 고르기 → 코스 생성 흐름", async ({ page }) => {
  await page.goto("/");

  // Step 1: 지역 + 모드
  const regionSelect = page.getByLabel("지역 선택");
  await expect(regionSelect).toBeVisible();
  await expect(regionSelect).toContainText("대구");
  await regionSelect.selectOption("daegu");

  await page.getByRole("button", { name: "다음: 사우나 고르기 →" }).click();

  // Step 2: 사우나 맵
  await expect(page.getByText("사우나·온천 지도 (대구)")).toBeVisible();
  // 하나 골라보기 (첫 카드)
  const firstCard = page.locator("button[aria-pressed]").first();
  await firstCard.click();

  await page.getByRole("button", { name: /선택한 사우나로 →|추천 받기 →/ }).click();

  // Step 3: 부가 옵션
  await page.getByRole("button", { name: "2일" }).click();
  await page.getByRole("button", { name: "프리미엄" }).click();
  await page.getByRole("button", { name: "코스 만들기" }).click();

  // 코스 결과 대기 (폴백이어도 표시됨)
  const heading = page.getByText(/대구 · \d일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });

  await expect(page.getByText(/예상 비용/)).toBeVisible();
});

test("9곳 지역이 드롭다운에 모두 있다", async ({ page }) => {
  await page.goto("/");
  const regionSelect = page.getByLabel("지역 선택");
  for (const name of ["서울", "부산", "강원", "경주", "제주", "인천", "대전", "광주", "대구"]) {
    await expect(regionSelect).toContainText(name);
  }
});

test("사우나를 고르지 않아도 추천 코스가 생성된다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택").selectOption("jeju");
  await page.getByRole("button", { name: "다음: 사우나 고르기 →" }).click();
  await expect(page.getByText("사우나·온천 지도 (제주)")).toBeVisible();
  await page.getByRole("button", { name: /추천 받기 →/ }).click();
  await page.getByRole("button", { name: "코스 만들기" }).click();

  const heading = page.getByText(/제주 · \d일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });
});

test("코스 생성 후 '다시 만들기'가 동작한다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택").selectOption("jeju");
  await page.getByRole("button", { name: "다음: 사우나 고르기 →" }).click();
  await page.getByRole("button", { name: /추천 받기 →/ }).click();
  await page.getByRole("button", { name: "코스 만들기" }).click();

  const heading = page.getByText(/제주 · \d일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });

  await page.getByRole("button", { name: "다시 만들기" }).click();
  await expect(page.getByText(/제주 · \d일 코스/)).toBeVisible({ timeout: 20000 });
});
