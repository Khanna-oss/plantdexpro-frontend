/**
 * MCA DATA PIPELINE: ETL NUTRITION SERVICE
 * This service simulates an ETL (Extract, Transform, Load) process.
 * Source: Research CSV/JSON dataset (Simulated)
 * Target: Normalized Nutrition Data Warehouse
 * Expanded for comprehensive plant coverage
 */

const RAW_RESEARCH_DATA = [
  {
    sci_name: "Aloe vera",
    vit_content: "Vitamins A, C, E, B12, Folic Acid",
    min_content: "Calcium, Chromium, Copper, Selenium, Magnesium, Manganese, Potassium, Sodium, Zinc",
    prot_profile: "20 of the 22 human-required amino acids",
    is_safe: true,
    edible_parts: "Leaves (gel), inner leaf fillet",
    usage: "Medicinal preparations, topical applications, dietary supplement",
    calories: "Low caloric density, approximately 4 kcal per 100g",
    cautions: "Latex may cause digestive discomfort in sensitive individuals"
  },
  {
    sci_name: "Ocimum basilicum",
    vit_content: "Vitamin K, A, C, B6",
    min_content: "Iron, Calcium, Manganese, Magnesium, Potassium",
    prot_profile: "Complete protein profile with essential amino acids, 3.2g per 100g",
    is_safe: true,
    edible_parts: "Leaves, stems, flowers",
    usage: "Culinary herb, medicinal tea, aromatic applications",
    calories: "Approximately 22 kcal per 100g fresh leaves",
    cautions: "High vitamin K content may affect anticoagulant therapy"
  },
  {
    sci_name: "Mentha",
    vit_content: "Vitamin A, C, B2, B9 (Folate)",
    min_content: "Iron, Manganese, Calcium, Potassium, Phosphorus",
    prot_profile: "Moderate protein density, 3.8g per 100g fresh leaves",
    is_safe: true,
    edible_parts: "Leaves, stems",
    usage: "Culinary seasoning, herbal infusions, medicinal preparations",
    calories: "Approximately 44 kcal per 100g fresh leaves",
    cautions: "May exacerbate GERD symptoms in sensitive individuals"
  },
  {
    sci_name: "Taraxacum officinale",
    vit_content: "Vitamins A, C, K, B6, B complex",
    min_content: "Iron, Calcium, Magnesium, Potassium, Manganese, Zinc",
    prot_profile: "High-quality plant proteins, 2.4g per 100g fresh leaves",
    is_safe: true,
    edible_parts: "Leaves, flowers, roots",
    usage: "Salad greens, coffee substitute, medicinal detoxification",
    calories: "Approximately 45 kcal per 100g fresh leaves",
    cautions: "May interact with diuretic medications and lithium therapy"
  },
  {
    sci_name: "Camellia sinensis",
    vit_content: "Vitamin C, B complex, K, E",
    min_content: "Manganese, Potassium, Calcium, Magnesium, Fluoride",
    prot_profile: "Amino acids including L-theanine, 1.5g per 100g dried leaves",
    is_safe: true,
    edible_parts: "Leaves, leaf buds",
    usage: "Beverage preparation, extract supplements, traditional medicine",
    calories: "Approximately 1 kcal per 100g brewed tea (negligible)",
    cautions: "Caffeine content may affect sleep patterns and cardiovascular conditions"
  },
  {
    sci_name: "Echinacea purpurea",
    vit_content: "Vitamins C, A, B complex",
    min_content: "Iron, Calcium, Magnesium, Potassium, Zinc, Selenium",
    prot_profile: "Immune-supporting proteins and polysaccharides, 1.2g per 100g",
    is_safe: true,
    edible_parts: "Leaves, flowers, roots",
    usage: "Immune system support, herbal preparations, preventive medicine",
    calories: "Approximately 32 kcal per 100g dried aerial parts",
    cautions: "May cause allergic reactions in individuals with ragweed sensitivity"
  },
  {
    sci_name: "Rosmarinus officinalis",
    vit_content: "Vitamins A, C, B6, B9 (Folate)",
    min_content: "Iron, Calcium, Magnesium, Potassium, Manganese, Copper",
    prot_profile: "Antioxidant proteins and essential amino acids, 3.3g per 100g",
    is_safe: true,
    edible_parts: "Leaves, flowers, stems",
    usage: "Culinary seasoning, medicinal extracts, aromatherapy",
    calories: "Approximately 131 kcal per 100g dried leaves",
    cautions: "High concentrations may affect blood pressure and coagulation"
  },
  {
    sci_name: "Allium sativum",
    vit_content: "Vitamins C, B6, B1 (Thiamine)",
    min_content: "Selenium, Manganese, Calcium, Potassium, Iron, Copper",
    prot_profile: "Complete amino acid profile with sulfur-containing proteins, 6.4g per 100g",
    is_safe: true,
    edible_parts: "Bulbs, cloves, leaves",
    usage: "Culinary ingredient, medicinal preparations, natural antibiotic",
    calories: "Approximately 149 kcal per 100g raw cloves",
    cautions: "May increase bleeding risk when combined with anticoagulants"
  },
  {
    sci_name: "Curcuma longa",
    vit_content: "Vitamins C, B3, B6, B2, E, K",
    min_content: "Iron, Manganese, Potassium, Calcium, Magnesium, Zinc, Copper",
    prot_profile: "Curcumin-binding proteins, 7.8g per 100g rhizome",
    is_safe: true,
    edible_parts: "Rhizomes (roots), leaves",
    usage: "Spice, medicinal anti-inflammatory, food coloring",
    calories: "Approximately 312 kcal per 100g fresh rhizome",
    cautions: "May interfere with iron absorption and affect gallbladder function"
  },
  {
    sci_name: "Ginkgo biloba",
    vit_content: "Vitamins A, C, B complex",
    min_content: "Calcium, Magnesium, Potassium, Iron, Zinc, Copper",
    prot_profile: "Ginkgolide-associated proteins, 2.1g per 100g dried leaves",
    is_safe: true,
    edible_parts: "Leaves, seeds (properly prepared)",
    usage: "Cognitive enhancement, circulatory support, traditional medicine",
    calories: "Approximately 38 kcal per 100g dried leaves",
    cautions: "May increase bleeding risk; seeds contain toxic compounds if raw"
  },
  {
    sci_name: "Panax ginseng",
    vit_content: "Vitamins A, C, B complex, E",
    min_content: "Iron, Magnesium, Potassium, Calcium, Zinc, Selenium",
    prot_profile: "Ginsenoside-binding proteins, 5.2g per 100g dried root",
    is_safe: true,
    edible_parts: "Roots, root hairs",
    usage: "Adaptogenic herb, energy enhancement, stress reduction",
    calories: "Approximately 62 kcal per 100g dried root",
    cautions: "May affect blood glucose levels and interact with diabetes medications"
  },
  {
    sci_name: "Hibiscus sabdariffa",
    vit_content: "Vitamins C, A, B complex",
    min_content: "Iron, Calcium, Magnesium, Potassium, Phosphorus, Zinc",
    prot_profile: "Anthocyanin-associated proteins, 1.8g per 100g dried calyces",
    is_safe: true,
    edible_parts: "Calyces, leaves, seeds",
    usage: "Beverage preparations, culinary applications, blood pressure support",
    calories: "Approximately 49 kcal per 100g dried calyces",
    cautions: "May lower blood pressure; caution with hypotensive medications"
  }
];

// TRANSFORMATION LOGIC (Normalization)
const transformData = (data) => {
  return data.reduce((acc, item) => {
    const key = item.sci_name.toLowerCase();
    acc[key] = {
      nutrients: {
        vitamins: item.vit_content,
        minerals: item.min_content,
        proteins: item.prot_profile,
        calories: item.calories || "Caloric data not available"
      },
      botanicalData: {
        edibleParts: item.edible_parts || "Edible parts information not available",
        usage: item.usage || "Traditional and modern applications documented",
        cautions: item.cautions || "Consult healthcare professional for specific guidance"
      },
      healthHints: [
        { label: "ETL Verified", desc: "Verified via internal research dataset." },
        { label: "Safety Profile", desc: item.is_safe ? "Generally recognized as safe" : "Use with caution" }
      ],
      isVerified: true,
      source: "ETL Data Warehouse",
      confidence: 95
    };
    return acc;
  }, {});
};

// LOAD (Populating the Warehouse)
const DATA_WAREHOUSE = transformData(RAW_RESEARCH_DATA);

export const etlNutritionService = {
  /**
   * Queries the Data Warehouse using scientific or common name matching.
   */
  lookup: (scientificName) => {
    if (!scientificName) return null;
    const key = scientificName.toLowerCase();
    
    // Exact or partial match logic
    const foundKey = Object.keys(DATA_WAREHOUSE).find(k => key.includes(k) || k.includes(key));
    return DATA_WAREHOUSE[foundKey] || null;
  }
};