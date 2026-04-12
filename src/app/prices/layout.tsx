import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Las Vegas Cannabis Price Comparison — Daily Weed Newspaper",
  description:
    "Real-time cannabis product prices from dispensaries across Las Vegas, NV. Compare flower, edibles, vapes, and concentrates. Updated hourly.",
  alternates: {
    canonical: "https://www.dailyweednewspaper.com/prices",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Las Vegas Cannabis Price Intelligence",
  description:
    "Real-time cannabis product prices from dispensaries across Las Vegas, NV. Updated hourly.",
  url: "https://www.dailyweednewspaper.com/prices",
  creator: {
    "@type": "Organization",
    name: "Daily Weed Newspaper",
    url: "https://www.dailyweednewspaper.com",
  },
  spatialCoverage: "Las Vegas, Nevada, USA",
  temporalCoverage: "2024/..",
  license: "https://creativecommons.org/licenses/by/4.0/",
};

export default function PricesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
