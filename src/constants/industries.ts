export const INDUSTRIES = [
  // Tech
  { value: "software_it", label: "Software / IT" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "ai_ml", label: "AI / Machine Learning" },
  { value: "telecommunications", label: "Telecommunications" },

  // Business
  { value: "finance_banking", label: "Finance / Banking" },
  { value: "consulting", label: "Consulting" },
  { value: "insurance", label: "Insurance" },
  { value: "real_estate", label: "Real Estate" },

  // Industry
  { value: "manufacturing", label: "Manufacturing" },
  { value: "energy_utilities", label: "Energy / Utilities" },
  { value: "automotive", label: "Automotive" },
  { value: "aerospace_defense", label: "Aerospace / Defense" },

  // Services
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "legal", label: "Legal" },
  { value: "media_entertainment", label: "Media / Entertainment" },
  { value: "retail_ecommerce", label: "Retail / E-commerce" },
  { value: "hospitality_tourism", label: "Hospitality / Tourism" },

  // Public
  { value: "government_public", label: "Government / Public Sector" },
  { value: "nonprofit_ngo", label: "Non-Profit / NGO" },

  // Cross
  { value: "startup", label: "Startup (cross-industry)" },
  { value: "other", label: "Other" },
] as const;

export type IndustryValue = (typeof INDUSTRIES)[number]["value"];

export const INDUSTRY_VALUES = INDUSTRIES.map((i) => i.value);
