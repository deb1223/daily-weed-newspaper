import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Dispensary Deals in Las Vegas Today | Daily Weed Newspaper",
  description:
    "Compare cannabis prices across every Las Vegas dispensary. Sort by THC mg per dollar and find the best deals — updated daily.",
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
