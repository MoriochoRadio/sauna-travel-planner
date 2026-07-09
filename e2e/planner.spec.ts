import { test, expect } from "@playwright/test";

// 사용자 플로우 E2E: 폼 입력 → 코스 생성 → 표시
test("지역 선택·기간·취향 입력 후 코스가 표시된다", async ({ page }) => {
  await page.goto("/");

  // 지역 드롭다운 (9곳 포함 확인)
  const regionSelect = page.getByLabel("지역 선택");
  await expect(regionSelect).toBeVisible();
  await expect(regionSelect).toContainText("대구");

  // 대구 선택
  await regionSelect.selectOption("daegu");

  // 기간 2일 (기본값) 확인
  await page.getByRole("button", { name: "2일" }).click();

  // 취향: 프리미엄 선택
  await page.getByRole("button", { name: "프리미엄" }).click();

  // 코스 만들기
  await page.getByRole("button", { name: "코스 만들기" }).click();

  // 코스 결과 대기 (폴백이어도 표시됨)
  const heading = page.getByText(/대구 · \d일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });

  // 예상 비용 표시 확인
  await expect(page.getByText(/예상 비용/)).toBeVisible();
});

test("9곳 지역이 드롭다운에 모두 있다", async ({ page }) => {
  await page.goto("/");
  const regionSelect = page.getByLabel("지역 선택");
  for (const name of ["서울", "부산", "강원", "경주", "제주", "인천", "대전", "광주", "대구"]) {
    await expect(regionSelect).toContainText(name);
  }
});

test("코스 생성 후 '다시 만들기'가 동작한다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택").selectOption("jeju");
  await page.getByRole("button", { name: "코스 만들기" }).click();

  const heading = page.getByText(/제주 · \d일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });

  await page.getByRole("button", { name: "다시 만들기" }).click();
  // 로딩 또는 재생성 결과
  await expect(page.getByText(/제주 · \d일 코스/)).toBeVisible({ timeout: 20000 });
});
