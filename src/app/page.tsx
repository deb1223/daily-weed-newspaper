export const dynamic = "force-dynamic";

import { getAllPageData } from "@/lib/data";
import NewspaperClient from "./components/NewspaperClient";

export default async function HomePage() {
  const data = await getAllPageData();
  return <NewspaperClient data={data} />;
}
