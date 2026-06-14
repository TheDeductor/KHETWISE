export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
  category: "satellite" | "agronomy" | "market" | "irrigation" | "disease";
  link?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  NDVI: {
    term: "NDVI",
    short: "A measure of crop greenness from satellite imagery (0–1). Higher = healthier.",
    long: "Normalized Difference Vegetation Index (NDVI) measures the amount of live green vegetation in a crop field using satellite data. Values range from −1 to +1. Healthy crops typically score 0.4–0.9. Values below 0.3 may indicate stress, disease, or bare soil. Khetwise calculates this from Sentinel-2 satellite passes every ~5 days.",
    category: "satellite",
    link: "https://en.wikipedia.org/wiki/Normalized_difference_vegetation_index",
  },
  "Health Score": {
    term: "Health Score",
    short: "Overall 0–100 score combining NDVI, stress signals, and historical trends.",
    long: "The Khetwise Health Score is a composite index (0–100) derived from NDVI, soil moisture estimates, historical yield patterns, and any detected stress anomalies. A score above 70 is considered healthy; 40–70 is stressed; below 40 is at risk. It is recalculated with each new satellite pass.",
    category: "satellite",
  },
  "ET₀": {
    term: "ET₀",
    short: "Reference Evapotranspiration — how much water the atmosphere would pull from a standard grass crop today.",
    long: "ET₀ (Reference Evapotranspiration) is the water demand of the atmosphere, calculated using the FAO Penman-Monteith equation with temperature, humidity, wind speed, and solar radiation data. Multiplying ET₀ by your crop coefficient (Kc) gives the actual crop water demand (ETc), which drives the irrigation schedule.",
    category: "irrigation",
    link: "https://www.fao.org/3/X0490E/x0490e00.htm",
  },
  ETc: {
    term: "ETc",
    short: "Crop Evapotranspiration — actual water needed by YOUR crop today.",
    long: "ETc = ET₀ × Kc (crop coefficient). While ET₀ is a universal reference, ETc accounts for the specific water needs of your crop variety and growth stage. The crop coefficient Kc changes across the season — it is low at planting, peaks at flowering, and drops again near harvest.",
    category: "irrigation",
  },
  Kc: {
    term: "Kc",
    short: "Crop Coefficient — multiplier that converts reference ET₀ into your crop's actual water need.",
    long: "The Crop Coefficient (Kc) reflects how a specific crop's water demand differs from the reference crop (grass). Kc values are published by FAO for each crop and growth stage. For example, cotton has Kc ~0.45 at initial stage, rising to ~1.2 at mid-season, then falling to ~0.5 at harvest.",
    category: "irrigation",
    link: "https://www.fao.org/3/X0490E/x0490e0b.htm",
  },
  Kharif: {
    term: "Kharif",
    short: "Summer / monsoon season crops (June–November). E.g., Cotton, Rice, Maize, Soybean.",
    long: "Kharif crops are sown at the beginning of the summer monsoon (June–July) and harvested in autumn (September–November). They require warm, humid conditions and heavy rainfall. Major Kharif crops in India include Rice, Jowar, Bajra, Maize, Cotton, Groundnut, Soybean, and Sugarcane.",
    category: "agronomy",
    link: "https://en.wikipedia.org/wiki/Kharif_crop",
  },
  Rabi: {
    term: "Rabi",
    short: "Winter season crops (November–April). E.g., Wheat, Mustard, Gram, Peas.",
    long: "Rabi crops are sown after the monsoon in October–November when temperatures begin to fall. They grow through the cool winter and are harvested in March–April. Major Rabi crops include Wheat, Barley, Gram (chickpea), Mustard, Linseed, and Peas.",
    category: "agronomy",
    link: "https://en.wikipedia.org/wiki/Rabi_crop",
  },
  Zaid: {
    term: "Zaid",
    short: "Short summer crop season between Rabi and Kharif (March–June). E.g., Watermelon, Cucumber.",
    long: "Zaid is a minor crop season in India, grown between the Rabi and Kharif seasons (March–June). Crops are fast-maturing and typically require irrigation. Common Zaid crops include Watermelon, Muskmelon, Cucumber, Bitter Gourd, Pumpkin, and Sunflower.",
    category: "agronomy",
  },
  MSP: {
    term: "MSP",
    short: "Minimum Support Price — the government-guaranteed floor price for your crop.",
    long: "The Minimum Support Price (MSP) is declared by the Government of India (CACP) before each season to ensure farmers receive at least this price for their produce. It acts as a safety net against price crashes. However, actual mandi prices can be above or below MSP depending on supply, demand, and quality.",
    category: "market",
    link: "https://cacp.dacnet.nic.in/",
  },
  Mandi: {
    term: "Mandi",
    short: "Agricultural wholesale market where farmers sell their produce through auction.",
    long: "A Mandi (APMC market) is a regulated wholesale marketplace where farmers bring their produce to sell through an open auction process. Buyers, including traders, processors, and exporters, bid for the produce. The final price depends on quality, quantity, and local demand. Prices vary significantly between mandis, which is why comparing rates before selling is important.",
    category: "market",
  },
  APMC: {
    term: "APMC",
    short: "Agricultural Produce Market Committee — the authority that governs each regulated mandi.",
    long: "APMCs (Agricultural Produce Market Committees) are state government bodies that oversee wholesale agricultural markets. They set rules for trading, licensing of traders and commission agents, and fee collection. The 2020 Farm Bills attempted to allow trading outside APMCs, but implementation varies by state.",
    category: "market",
  },
  Wilt: {
    term: "Wilt",
    short: "A disease that blocks water transport inside the plant, causing sudden drooping/death.",
    long: "Wilting diseases are caused by fungal pathogens (like Fusarium, Verticillium) or bacteria that colonize the plant's vascular (water-conducting) system. The pathogen blocks water flow, causing leaves and stems to droop even when soil moisture is adequate. In severe cases (Fusarium wilt in cotton, for example), entire plants can die within days.",
    category: "disease",
  },
  Blight: {
    term: "Blight",
    short: "A disease causing rapid browning and death of leaves, stems, or fruit.",
    long: "Blight is a general term for diseases that cause rapid yellowing, browning, and death of plant tissue. Common types include Early Blight and Late Blight (caused by Alternaria and Phytophthora), which severely affect tomato and potato. Blights spread rapidly in humid conditions and can destroy a crop within days if left untreated.",
    category: "disease",
  },
  "Leaf Spot": {
    term: "Leaf Spot",
    short: "Fungal or bacterial lesions that appear as brown/black spots on leaves.",
    long: "Leaf spot diseases create discrete circular or irregular lesions on leaves caused by various fungi (Cercospora, Alternaria) or bacteria. While rarely fatal alone, heavy infection causes premature leaf drop, reducing photosynthesis and yield. The spots often have a yellow halo and a dark center.",
    category: "disease",
  },
  Rust: {
    term: "Rust",
    short: "A fungal disease producing orange-brown powdery pustules on leaves.",
    long: "Rust diseases are caused by obligate fungal parasites (Puccinia species) and appear as orange, yellow, or brown powdery spots (pustules) on leaf undersides. Wheat rust (stripe rust, leaf rust, stem rust) is a major threat to cereal production worldwide. Rust spreads by wind-borne spores and can devastate crops in cool, moist conditions.",
    category: "disease",
    link: "https://www.fao.org/wheat-rust/en/",
  },
  "Powdery Mildew": {
    term: "Powdery Mildew",
    short: "A fungal disease that covers leaves in white powdery growth.",
    long: "Powdery mildew is caused by various ascomycete fungi and appears as white or grey powdery patches on leaves, shoots, and buds. Unlike most fungal diseases, it thrives in dry conditions with high humidity. It reduces photosynthesis by coating leaf surfaces. Common in grapes, cucurbits, wheat, and pulses.",
    category: "disease",
  },
  Confidence: {
    term: "AI Confidence",
    short: "How certain the AI model is about its disease prediction (0–100%).",
    long: "AI Confidence is the probability score the machine learning model assigns to its top prediction. A confidence of 90% means the model is 90% sure of its diagnosis based on visual patterns in the leaf image. Lower confidence (below 60%) may indicate an unclear image, mixed infection, or an unusual disease variant — consider retaking the photo in good light.",
    category: "disease",
  },
  Sentinel: {
    term: "Sentinel-2",
    short: "ESA satellite that captures crop health data every 5 days.",
    long: "Sentinel-2 is a pair of Earth observation satellites operated by the European Space Agency (ESA) as part of the Copernicus programme. They capture multispectral imagery at 10–60m resolution every 5 days. Khetwise uses Sentinel-2 bands to calculate NDVI, crop stress indicators, and land use maps over your field.",
    category: "satellite",
    link: "https://sentinel.esa.int/web/sentinel/missions/sentinel-2",
  },
  "Soil Moisture": {
    term: "Soil Moisture",
    short: "The percentage of water held in the soil. Drives irrigation decisions.",
    long: "Soil moisture is the amount of water present in the soil, usually expressed as a percentage of saturation. Plant-available water sits between Field Capacity (upper limit, after drainage) and Permanent Wilting Point (lower limit, plant can no longer extract water). Irrigation is triggered when available moisture drops below a crop-specific threshold.",
    category: "irrigation",
  },
  "Field Capacity": {
    term: "Field Capacity",
    short: "The maximum water a soil can hold after excess has drained away.",
    long: "Field Capacity is the soil moisture content after it has been saturated and free water has drained away (typically 1–3 days after rainfall). It represents the upper ideal limit for soil water content. Irrigating beyond field capacity causes waterlogging and runoff, wasting water and leaching nutrients.",
    category: "irrigation",
  },
  FPO: {
    term: "FPO",
    short: "Farmer Producer Organisation — a collective that gives small farmers market bargaining power.",
    long: "A Farmer Producer Organisation (FPO) is a registered company or cooperative formed by farmers. By pooling produce, FPOs can negotiate better prices with buyers, access credit at lower rates, and reduce input costs through bulk purchasing. The Government of India has a scheme to promote 10,000 new FPOs.",
    category: "market",
  },
  "Crop Coefficient": {
    term: "Crop Coefficient",
    short: "See Kc — a multiplier adjusting reference ET₀ for your specific crop and stage.",
    long: "The Crop Coefficient (Kc) adjusts the reference evapotranspiration (ET₀) to account for the specific characteristics of a crop at different growth stages. FAO Irrigation and Drainage Paper 56 provides Kc tables for most major crops. Khetwise uses these values with your crop and sowing date to calculate precise irrigation requirements.",
    category: "irrigation",
  },
  "Gross Margin": {
    term: "Gross Margin",
    short: "Revenue minus variable farming costs — your profit before fixed costs.",
    long: "Gross Margin = Total Revenue − Variable Costs (seeds, fertilizer, pesticides, labour, irrigation). It represents the return on your farming operations before accounting for land rent, machinery depreciation, or loan interest. Khetwise estimates this based on your crop, area, local mandi prices, and typical input costs.",
    category: "market",
  },
  pH: {
    term: "Soil pH",
    short: "Acidity/alkalinity of soil (0–14). Most crops need pH 6–7.5.",
    long: "Soil pH measures acidity (below 7) or alkalinity (above 7) on a logarithmic scale. Most crops grow best in slightly acidic to neutral soil (pH 6.0–7.5). pH affects nutrient availability, microbial activity, and root development. Acidic soils (common in high-rainfall areas) can be corrected with lime; alkaline soils (common in arid regions) with gypsum or sulphur.",
    category: "agronomy",
  },
  Micronutrient: {
    term: "Micronutrient",
    short: "Essential trace elements (Zinc, Iron, Boron, Manganese) needed in small amounts.",
    long: "Micronutrients are mineral elements required by crops in very small quantities but are essential for healthy growth. Key micronutrients include Zinc (Zn), Iron (Fe), Manganese (Mn), Boron (B), Copper (Cu), and Molybdenum (Mo). India has widespread Zinc deficiency in agricultural soils, contributing significantly to crop yield loss.",
    category: "agronomy",
  },
  "Vernalisation": {
    term: "Vernalisation",
    short: "Cold period some crops need before they can flower (e.g., wheat).",
    long: "Vernalisation is the requirement of certain crops (especially winter cereals like wheat and barley) for a prolonged period of cold temperatures before they can transition from vegetative growth to flowering. Without adequate cold exposure, these crops may fail to head or flower at the right time, reducing yield.",
    category: "agronomy",
  },
  Intercropping: {
    term: "Intercropping",
    short: "Growing two or more crops simultaneously in the same field.",
    long: "Intercropping involves cultivating two or more crops together in the same field at the same time. It can improve land productivity, reduce pest pressure, improve soil health (e.g., legume–cereal mixes), and provide income diversification. Common systems include cotton–groundnut, maize–bean, and sorghum–cowpea intercropping in India.",
    category: "agronomy",
  },
  "Drip Irrigation": {
    term: "Drip Irrigation",
    short: "Water delivered directly to roots via small emitters — saves 40–60% water vs flood.",
    long: "Drip irrigation delivers water drop-by-drop directly to the root zone through a network of pipes, tubes, and emitters. It reduces evaporation and runoff, saving 40–60% of water compared to flood irrigation. Suitable for fruits, vegetables, cotton, and sugarcane. The Government of India subsidises drip systems under PMKSY (Pradhan Mantri Krishi Sinchayee Yojana).",
    category: "irrigation",
  },
  "Open-Meteo": {
    term: "Open-Meteo",
    short: "Free, open-source weather API used by Khetwise for 7-day forecasts.",
    long: "Open-Meteo is a free, open-source weather forecast API that provides high-resolution numerical weather prediction data from ECMWF, GFS, and other models. Khetwise uses it to fetch temperature, humidity, wind speed, solar radiation, and precipitation forecasts for your field location, which drive the ET₀ and irrigation calculations.",
    category: "irrigation",
    link: "https://open-meteo.com",
  },
};

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  // Exact match first
  if (GLOSSARY[term]) return GLOSSARY[term];
  // Case-insensitive match
  const lower = term.toLowerCase();
  for (const key of Object.keys(GLOSSARY)) {
    if (key.toLowerCase() === lower) return GLOSSARY[key];
  }
  return undefined;
}
