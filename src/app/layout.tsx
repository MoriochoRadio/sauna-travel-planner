import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사우나 여행 코스 메이커",
  description: "한국 사우나·찜질방·온천을 축으로 맛집과 볼거리, 숙소를 엮은 맞춤 여행 코스 생성기",
  themeColor: "#E8743B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
