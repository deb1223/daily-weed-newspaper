/** Format weight_grams as a display string: 3.5 → "3.5g", 14 → "14g" */
export function formatGrams(grams: number): string {
  const g = Number(grams);
  return g % 1 === 0 ? `${g}g` : `${parseFloat(g.toFixed(1))}g`;
}

/** Extract first mg value from a product name: "Sour Apple 100mg 10pk" → "100mg" */
export function extractMg(name: string): string | null {
  const m = name.match(/(\d+)\s*mg/i);
  return m ? `${m[1]}mg` : null;
}

/**
 * Returns a size/dose display string for a product.
 * Used in both the homepage deal boxes and the /prices table.
 */
export function displayProductSize(
  name: string,
  category: string | null,
  weightGrams: number | null
): string {
  const cat = (category ?? "").toLowerCase();

  if (/accessor/i.test(cat)) return "—";

  if (/edible|tincture|oral/i.test(cat)) {
    const mg = extractMg(name);
    if (mg) return `${mg} THC`;
    // weight_grams > 10 is almost certainly a liquid volume in ml
    if (weightGrams && weightGrams > 10) return `${weightGrams}ml`;
    return "—";
  }

  if (!weightGrams) return "—";
  return formatGrams(weightGrams);
}
