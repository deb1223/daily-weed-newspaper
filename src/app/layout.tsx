import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Weed Newspaper — Cannabis Price Intelligence",
  description:
    "The only cannabis publication that actually gives a damn about your wallet. Real-time dispensary price comparison for Las Vegas.",
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
