import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

// 제목 계열에만 쓰는 명조 — 온기행 톤의 중심.
// preload를 끄면 subsets 지정 없이도 한글 유니코드 레인지가 모두 포함되며,
// 빌드 시 자체 호스팅되므로 런타임에 외부 요청이 나가지 않는다.
const notoSerifKr = Noto_Serif_KR({
  preload: false,
  display: "swap",
  variable: "--font-serif-kr",
  fallback: ["Nanum Myeongjo", "Batang", "serif"],
});

const siteUrl = "https://sauna-travel-planner.vercel.app";
const description =
  "한국 사우나·찜질방·온천을 축으로 맛집과 볼거리, 숙소를 엮은 맞춤 여행 코스 생성기";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "사우나 여행 코스 메이커",
  description,
  // 링크를 공유해도 미리보기가 뜨지 않아 og·twitter 카드를 함께 둔다.
  openGraph: {
    type: "website",
    siteName: "사우나 여행 코스 메이커",
    title: "사우나 여행 코스 메이커",
    description,
    url: siteUrl,
    locale: "ko_KR",
    images: [{ url: "/onsen-guide-hero.webp", width: 1200, height: 420, alt: "" }],
  },
  twitter: { card: "summary_large_image", title: "사우나 여행 코스 메이커", description },
};

export const viewport: Viewport = {
  // 히어로가 딥그린으로 시작하므로 브라우저 크롬도 같은 색으로 맞춘다
  themeColor: "#16291F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSerifKr.variable}>
      <body>{children}</body>
    </html>
  );
}
