import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

async function cleanNuwuNames() {
  const { data: nuwuDisps } = await supabase
    .from("dispensaries")
    .select("id")
    .ilike("name", "%nuwu%");

  if (!nuwuDisps || nuwuDisps.length === 0) {
    console.log("Nuwu dispensary not found");
    return;
  }

  const nuwuIds = nuwuDisps.map((d) => d.id);
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("dispensary_id", nuwuIds);

  let cleaned = 0;
  for (const p of products ?? []) {
    const newName = p.name
      .replace(/^M\{[^}]+\}\s*/i, "")
      .replace(/\s*N\{[^}]+\}/gi, "")
      .trim();
    if (newName !== p.name) {
      await supabase
        .from("products")
        .update({ name: newName })
        .eq("id", p.id);
      cleaned++;
    }
  }
  console.log(`Cleaned ${cleaned} Nuwu product names`);
}

cleanNuwuNames();
