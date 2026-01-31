/**
 * MCA DATA PIPELINE: ETL NUTRITION SERVICE
 * This service simulates an ETL (Extract, Transform, Load) process.
 * Source: Research CSV/JSON dataset (Simulated)
 * Target: Normalized Nutrition Data Warehouse
 */

const RAW_RESEARCH_DATA = [
  {
    sci_name: "Aloe vera",
    vit_content: "Vitamins A, C, E, B12, Folic Acid",
    min_content: "Calcium, Chromium, Copper, Selenium, Magnesium, Manganese, Potassium, Sodium, Zinc",
    prot_profile: "20 of the 22 human-required amino acids",
    is_safe: true
  },
  {
    sci_name: "Ocimum basilicum",
    vit_content: "Vitamin K, A, C",
    min_content: "Iron, Calcium, Manganese, Magnesium",
    prot_profile: "High levels of Essential Amino Acids per 100g",
    is_safe: true
  },
  {
    sci_name: "Mentha",
    vit_content: "Vitamin A, C",
    min_content: "Iron, Manganese, Folate",
    prot_profile: "Low caloric protein density",
    is_safe: true
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
        proteins: item.prot_profile
      },
      healthHints: [
        { label: "Botanical Standard", desc: "Verified via internal research dataset." }
      ],
      isVerified: true
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