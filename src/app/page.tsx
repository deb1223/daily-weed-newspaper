export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllPageData } from "@/lib/data";
import NewspaperClient from "./components/NewspaperClient";

export const metadata: Metadata = {
  title: "Daily Weed Newspaper — Las Vegas Cannabis Price Comparison & Deals",
  description:
    "Real-time dispensary price comparison for Las Vegas. Sort by THC per dollar, price, and category across 57+ dispensaries. Find deals you didn't know existed.",
};

export default async function HomePage() {
  const data = await getAllPageData();
  return <NewspaperClient data={data} />;
}
