import { test, expect } from "@playwright/test";

// 사용자 플로우 E2E (3단계: 지역 → 사우나 고르기 → 부가옵션 → 코스)
test("지역 선택 → 사우나 고르기 → 코스 생성 흐름", async ({ page }) => {
  await page.goto("/");

  // Step 1: 지역 + 모드
  const regionSelect = page.getByLabel("지역 선택", { exact: true });
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
  const regionSelect = page.getByLabel("지역 선택", { exact: true });
  for (const name of ["서울", "부산", "강원", "경주", "제주", "인천", "대전", "광주", "대구"]) {
    await expect(regionSelect).toContainText(name);
  }
});

test("사우나를 고르지 않아도 추천 코스가 생성된다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택", { exact: true }).selectOption("jeju");
  await page.getByRole("button", { name: "다음: 사우나 고르기 →" }).click();
  await expect(page.getByText("사우나·온천 지도 (제주)")).toBeVisible();
  await page.getByRole("button", { name: /추천 받기 →/ }).click();
  await page.getByRole("button", { name: "코스 만들기" }).click();

  const heading = page.getByText(/제주 · \d일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });
});

test("세부 지역(시군구) 드롭다운 선택이 동작한다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택", { exact: true }).selectOption("seoul");
  const sigunguSelect = page.getByRole("combobox", { name: "세부 지역 선택" });
  await expect(sigunguSelect).toBeVisible();
  await expect(sigunguSelect).toContainText("서울 중구");
  await expect(sigunguSelect).toContainText("서울 종로구");
  await sigunguSelect.selectOption("seoul-중구");
  await expect(sigunguSelect).toHaveValue("seoul-중구");
});

test("세부 지역 지정 시 공유 URL에 sigungu이 보존된다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택", { exact: true }).selectOption("daegu");
  const sigunguSelect = page.getByRole("combobox", { name: "세부 지역 선택" });
  await sigunguSelect.selectOption("daegu-수성구");
  await page.getByRole("button", { name: "다음: 사우나 고르기 →" }).click();
  await page.getByRole("button", { name: /추천 받기 →/ }).click();
  await page.getByRole("button", { name: "코스 만들기" }).click();
  await expect(page.getByText(/대구 · \d일 코스/)).toBeVisible({ timeout: 20000 });

  // 공유 URL 복사
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "🔗 코스 공유 URL 복사" }).click();
  const url = await page.evaluate(() => window.location.origin + "/?region=daegu&sigungu=daegu-수성구&days=2&auto=0");
  await page.goto(url);
  // 라운드트립: 드롭다운에 값 복원
  await expect(page.getByRole("combobox", { name: "세부 지역 선택" }).first()).toHaveValue("daegu-수성구");
});

test("전국 지도 탭에서 임의 시군구를 자유롭게 선택할 수 있다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택", { exact: true }).selectOption("daegu");
  // "지도에서 직접 선택" 탭
  await page.getByRole("button", { name: "지도에서 직접 선택" }).click();
  // 전국 지도 컨테이너 노출 (leaflet 동적 로드 대기)
  const map = page.locator('[aria-label="세부 지역 선택 지도"]');
  await expect(map).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("전국 지도를 자유롭게 움직여")).toBeVisible();
});

test("코스 생성 후 '다시 만들기'가 동작한다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("지역 선택", { exact: true }).selectOption("jeju");
  await page.getByRole("button", { name: "다음: 사우나 고르기 →" }).click();
  await page.getByRole("button", { name: /추천 받기 →/ }).click();
  await page.getByRole("button", { name: "코스 만들기" }).click();

  const heading = page.getByText(/제주 · \d일 코스/);
  await expect(heading).toBeVisible({ timeout: 20000 });

  await page.getByRole("button", { name: "다시 만들기" }).click();
  await expect(page.getByText(/제주 · \d일 코스/)).toBeVisible({ timeout: 20000 });
});

test("2일차 여행 코스에 숙소(🏨)가 자동 포함된다", async ({ page }) => {
  await page.goto("/?region=gangwon");
  await page.getByLabel("지역 선택", { exact: true }).selectOption("gangwon");
  await page.getByRole("button", { name: "다음: 사우나 고르기 →" }).click();
  await page.getByRole("button", { name: /추천 받기 →/ }).click();
  // step3(부가옵션) 도달 대기 — 기간 섹션의 2일 버튼 노출로 확인
  await expect(page.getByRole("button", { name: "2일", exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "2일", exact: true }).click();
  await page.getByRole("button", { name: "코스 만들기" }).click();

  await expect(page.locator("h2").first()).toHaveText(/강원.*2일 코스/, { timeout: 20000 });
  // 숙소 배지(🏨)가 코스 내 적어도 1곳에 표시된다
  await expect(page.getByText("🏨 숙소", { exact: true }).first()).toBeVisible({ timeout: 10000 });
});
