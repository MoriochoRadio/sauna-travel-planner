/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── 온기행 팔레트 (딥그린 구조색 + 테라코타 강조 + 웜페이퍼 바탕) ──
        pine: "#234034",
        "pine-soft": "#3B5A4B",
        "pine-deep": "#16291F",
        clay: "#B9603A",
        "clay-soft": "#F6E5DA",
        "clay-deep": "#8E4526",
        ember: "#E08A57",
        sage: "#7FA893",
        paper: "#FFFCF6",
        line: "#E5D9C8",

        // 기존 클래스명 호환 별칭 — 같은 색을 가리킨다.
        // (앱 전반이 onsen/bark/steam 이름을 쓰고 있어, 토큰만 갈아끼워 톤을 전환한다)
        cream: "#F7F3EC",
        "cream-2": "#EFE5D6",
        onsen: "#B9603A",
        "onsen-soft": "#F6E5DA",
        "onsen-deep": "#8E4526",
        bark: "#2A231D",
        "bark-soft": "#6F6157",
        steam: "#7FA893",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Malgun Gothic"',
          "sans-serif",
        ],
        // next/font가 --font-serif-kr을 심는다. 폰트 로드에 실패해도 선언 전체가
        // 무효가 되지 않도록 var()에 폴백을 함께 준다.
        serif: [
          "var(--font-serif-kr, 'Noto Serif KR')",
          '"Nanum Myeongjo"',
          "Batang",
          "serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 18px 44px -34px rgba(45,32,20,0.55)",
        "card-hover": "0 26px 60px -34px rgba(45,32,20,0.6)",
        cta: "0 14px 30px -14px rgba(185,96,58,0.7)",
        pine: "0 20px 50px -30px rgba(22,41,31,0.75)",
        // 3D 틸트 카드가 바닥에서 떠 보이게 하는 깊이 그림자
        lift: "0 40px 80px -50px rgba(22,41,31,0.85)",
      },
      borderRadius: {
        card: "22px",
        btn: "14px",
        pill: "999px",
      },
      backgroundImage: {
        "onsen-gradient": "linear-gradient(135deg, #B9603A 0%, #E08A57 100%)",
        "pine-gradient": "linear-gradient(150deg, #234034 0%, #16291F 100%)",
        "page-bg":
          "radial-gradient(120% 80% at 50% -10%, #F6E9DA 0%, #F7F3EC 42%, #F1E8DA 100%)",
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translate3d(0,26px,0)" },
          "100%": { opacity: "1", transform: "translate3d(0,0,0)" },
        },
        "scroll-cue": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "45%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "rise-in": "rise-in 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "scroll-cue": "scroll-cue 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
