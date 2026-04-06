import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Weed Newspaper — Cannabis Price Intelligence",
  description:
    "The only cannabis publication that actually gives a damn about your wallet. Real-time dispensary price comparison for Las Vegas.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Daily Weed Newspaper",
    description:
      "The only cannabis publication that actually gives a damn about your wallet.",
    url: "https://dailyweednewspaper.com",
    siteName: "Daily Weed Newspaper",
    images: [
      {
        url: "https://dailyweednewspaper.com/og",
        width: 1200,
        height: 630,
        alt: "Daily Weed Newspaper",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Weed Newspaper",
    description:
      "The only cannabis publication that actually gives a damn about your wallet.",
    images: ["https://dailyweednewspaper.com/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
