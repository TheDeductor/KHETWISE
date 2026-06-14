// Static ICAR-sourced Indian crop list
// Each crop: name, emoji, category (Kharif/Rabi/Zaid/Perennial), season hint

export interface Crop {
  name: string;
  emoji: string;
  category: "Kharif" | "Rabi" | "Zaid" | "Perennial";
}

export const CROPS: Crop[] = [
  // Kharif (Jun–Oct sow)
  { name: "Rice",        emoji: "🍚", category: "Kharif" },
  { name: "Maize",       emoji: "🌽", category: "Kharif" },
  { name: "Cotton",      emoji: "🌿", category: "Kharif" },
  { name: "Soybean",     emoji: "🫘", category: "Kharif" },
  { name: "Groundnut",   emoji: "🥜", category: "Kharif" },
  { name: "Jowar",       emoji: "🌾", category: "Kharif" },
  { name: "Bajra",       emoji: "🌾", category: "Kharif" },
  { name: "Arhar/Tur",   emoji: "🫘", category: "Kharif" },
  { name: "Moong",       emoji: "🫛", category: "Kharif" },
  { name: "Urad",        emoji: "🫛", category: "Kharif" },
  { name: "Sesame",      emoji: "🌱", category: "Kharif" },
  { name: "Sunflower",   emoji: "🌻", category: "Kharif" },
  { name: "Tomato",      emoji: "🍅", category: "Kharif" },
  { name: "Brinjal",     emoji: "🍆", category: "Kharif" },
  { name: "Okra",        emoji: "🥬", category: "Kharif" },
  { name: "Bitter Gourd",emoji: "🥒", category: "Kharif" },
  { name: "Bottle Gourd",emoji: "🫙", category: "Kharif" },
  { name: "Chilli",      emoji: "🌶", category: "Kharif" },
  { name: "Turmeric",    emoji: "🟡", category: "Kharif" },
  { name: "Ginger",      emoji: "🫚", category: "Kharif" },
  { name: "Banana",      emoji: "🍌", category: "Kharif" },

  // Rabi (Oct–Feb sow)
  { name: "Wheat",       emoji: "🌾", category: "Rabi" },
  { name: "Mustard",     emoji: "🌼", category: "Rabi" },
  { name: "Barley",      emoji: "🌾", category: "Rabi" },
  { name: "Gram/Chana",  emoji: "🫘", category: "Rabi" },
  { name: "Lentil/Masur",emoji: "🫘", category: "Rabi" },
  { name: "Peas",        emoji: "🫛", category: "Rabi" },
  { name: "Potato",      emoji: "🥔", category: "Rabi" },
  { name: "Onion",       emoji: "🧅", category: "Rabi" },
  { name: "Garlic",      emoji: "🧄", category: "Rabi" },
  { name: "Carrot",      emoji: "🥕", category: "Rabi" },
  { name: "Cauliflower", emoji: "🥦", category: "Rabi" },
  { name: "Cabbage",     emoji: "🥬", category: "Rabi" },
  { name: "Spinach",     emoji: "🥬", category: "Rabi" },
  { name: "Coriander",   emoji: "🌿", category: "Rabi" },
  { name: "Fenugreek",   emoji: "🌿", category: "Rabi" },
  { name: "Safflower",   emoji: "🌼", category: "Rabi" },
  { name: "Linseed",     emoji: "🌱", category: "Rabi" },

  // Zaid (Mar–Jun)
  { name: "Watermelon",  emoji: "🍉", category: "Zaid" },
  { name: "Muskmelon",   emoji: "🍈", category: "Zaid" },
  { name: "Cucumber",    emoji: "🥒", category: "Zaid" },
  { name: "Pumpkin",     emoji: "🎃", category: "Zaid" },
  { name: "Moong (Zaid)",emoji: "🫛", category: "Zaid" },

  // Perennial
  { name: "Sugarcane",   emoji: "🎋", category: "Perennial" },
  { name: "Coconut",     emoji: "🥥", category: "Perennial" },
  { name: "Mango",       emoji: "🥭", category: "Perennial" },
  { name: "Papaya",      emoji: "🫐", category: "Perennial" },
  { name: "Guava",       emoji: "🍏", category: "Perennial" },
  { name: "Pomegranate", emoji: "❤️", category: "Perennial" },
  { name: "Grapes",      emoji: "🍇", category: "Perennial" },
  { name: "Orange",      emoji: "🍊", category: "Perennial" },
];

export const CROP_CATEGORIES = ["Kharif", "Rabi", "Zaid", "Perennial"] as const;

export function searchCrops(query: string): Crop[] {
  if (!query.trim()) return CROPS;
  const q = query.toLowerCase();
  return CROPS.filter((c) => c.name.toLowerCase().includes(q));
}
