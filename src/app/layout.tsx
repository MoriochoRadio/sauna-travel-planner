import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#E8743B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
