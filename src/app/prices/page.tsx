// /prices now redirects to / via next.config.ts
// This file is kept so the build does not error; the redirect fires before rendering.
import { redirect } from "next/navigation";

export default function PricesPage() {
  redirect("/");
}
