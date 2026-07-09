import { defineConfig, devices } from "@playwright/test";

// CI(리눅스)에서는 Playwright가 설치한 브라우저를 기본 경로로 사용.
// 로컬(윈도우)에서만 하드코딩 경로 사용(PW_EXECUTABLE 또는 LOCALAPPDATA).
const isCI = !!process.env.CI;
const localExecutable =
  process.env.PW_EXECUTABLE ??
  `${process.env.LOCALAPPDATA}/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: isCI ? 2 : 1,
  use: {
    baseURL: "http://localhost:3939",
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    launchOptions: isCI
      ? {} // CI는 Playwright 기본 브라우저 사용
      : { executablePath: localExecutable },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start -- -p 3939",
    url: "http://localhost:3939",
    reuseExistingServer: !isCI,
    timeout: 60000,
  },
});
