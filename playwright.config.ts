import { defineConfig, devices } from "@playwright/test";

// 기본은 Playwright가 설치한 브라우저(`npx playwright install chromium`)를 쓴다.
// 다른 브라우저로 돌리고 싶을 때만 PW_EXECUTABLE 로 경로를 준다.
// (예전엔 로컬 경로에 브라우저 버전 번호를 박아 둬서 Playwright를 올릴 때마다 로컬 실행이 깨졌다)
const isCI = !!process.env.CI;
const localExecutable = process.env.PW_EXECUTABLE;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: isCI ? 2 : 1,
  use: {
    baseURL: "http://localhost:3939",
    headless: true,
    launchOptions: localExecutable ? { executablePath: localExecutable } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start -- -p 3939",
    url: "http://localhost:3939",
    reuseExistingServer: !isCI,
    timeout: 60000,
  },
});
