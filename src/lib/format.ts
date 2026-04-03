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
 * Calculates mg of THC per dollar spent.
 * Flower/Pre-Rolls/Concentrates/Vape: (thc% / 100 * weight_grams * 1000) / price
 * Edibles: extracted_mg_from_name / price
 * Everything else (Accessories, Tinctures, etc.): null
 */
export function calcMgPerDollar(
  name: string,
  category: string | null,
  thcPercentage: number | null,
  weightGrams: number | null,
  price: number | null
): number | null {
  if (!price || Number(price) <= 0) return null;
  const cat = (category ?? "").toLowerCase();

  if (/edible/i.test(cat)) {
    const m = name.match(/(\d+)\s*mg/i);
    if (!m) return null;
    return Number(m[1]) / Number(price);
  }

  if (/flower|pre.?roll|concentrate|extract|vape|vaporiz/i.test(cat)) {
    if (!thcPercentage || !weightGrams || Number(weightGrams) <= 0) return null;
    return (Number(thcPercentage) / 100 * Number(weightGrams) * 1000) / Number(price);
  }

  return null;
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
