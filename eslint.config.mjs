import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "src/data/seed.enriched.ts", // auto-generated tourAPI 동기화 결과
      "next-env.d.ts", // Next 자동 생성 파일
      "node_modules/**",
      ".next/**",
    ],
  },
  {
    // 테스트 파일: vitest globals(it/describe) 허용
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    languageOptions: {
      globals: { it: "readonly", describe: "readonly", expect: "readonly", beforeEach: "readonly", afterEach: "readonly", vi: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
