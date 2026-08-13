import { Camera, BookOpen, ChefHat, Search } from "lucide-react";

export const SITE_STATS = [
  { label: "Free Scans", val: "10/mo" },
  { label: "Recipes Generated", val: "1M+" },
  { label: "Cost to Start", val: "$0" },
  { label: "App Store Rating", val: "4.8" },
];

// Helper function for app stats
export const FEATURES = [
  {
    title: "Scan Your Pantry",
    description:
      "Photo recognition that actually works. Know what you have instantly.",
    icon: Camera,
    limit: "10 scans/mo free",
  },
  {
    title: "AI Chef Suggestions",
    description:
      "Turn random ingredients into a gourmet meal. Zero food waste.",
    icon: ChefHat,
    limit: "5 meals/mo free",
  },
  {
    title: "Search Any Dish",
    description:
      "Find any recipe instantly. Filter by cuisine, time, or dietary needs.",
    icon: Search,
    limit: "Unlimited searches",
  },
  {
    title: "Digital Cookbook",
    description: "Save your favorites. Export as PDF. Share with family.",
    icon: BookOpen,
    limit: "3 saves/mo free",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Scan",
    desc: "Point camera at fridge. AI identifies ingredients.",
  },
  {
    step: "02",
    title: "Select",
    desc: "Choose a generated recipe based on your mood.",
  },
  {
    step: "03",
    title: "Savor",
    desc: "Follow simple steps. Eat delicious food.",
  },
];

// Helper function for category emojis
export function getCategoryEmoji(category) {
  const emojiMap = {
    Beef: "🥩",
    Chicken: "🍗",
    Dessert: "🍰",
    Lamb: "🍖",
    Miscellaneous: "🍴",
    Pasta: "🍝",
    Pork: "🥓",
    Seafood: "🦐",
    Side: "🥗",
    Starter: "🥟",
    Vegan: "🥬",
    Vegetarian: "🥕",
    Breakfast: "🍳",
    Goat: "🐐",
  };
  return emojiMap[category] || "🍽️";
}

// Helper function for country representation
export function getCountryFlag(country) {
  const emojiMap = {
    American: "🗽",
    British: "👑",
    Canadian: "🍁",
    Chinese: "🐉",
    Croatian: "⚽",
    Dutch: "🌷",
    Egyptian: "🐫",
    Filipino: "🌴",
    French: "🥐",
    Greek: "🏛️",
    Indian: "🪷",
    Irish: "☘️",
    Italian: "🍕",
    Jamaican: "🌴",
    Japanese: "🗾",
    Kenyan: "🦒",
    Malaysian: "🌺",
    Mexican: "🌮",
    Moroccan: "🕌",
    Polish: "🦅",
    Portuguese: "🚢",
    Russian: "❄️",
    Spanish: "💃",
    Thai: "🛕",
    Tunisian: "🏜️",
    Turkish: "🧿",
    Ukrainian: "🌻",
    Vietnamese: "🍜",
    Algerian: "🏜️",
    Argentinian: "⚽",
    Australian: "🦘",
    Norwegian: "❄️",
    "Saudi Arabian": "🕋",
    Slovakian: "🏔️",
    Syrian: "🏛️",
    Uruguayan: "⚽",
    Venezuelan: "🌞",
  };

  return emojiMap[country] ?? "🌍";
}

export const cuisineAliases = {
  // American
  american: {
    api: "United States",
    display: "American",
  },
  "united-states": {
    api: "United States",
    display: "American",
  },

  // British
  british: {
    api: "United Kingdom",
    display: "British",
  },
  "united-kingdom": {
    api: "United Kingdom",
    display: "British",
  },

  // Canadian
  canadian: {
    api: "Canada",
    display: "Canadian",
  },
  canada: {
    api: "Canada",
    display: "Canadian",
  },

  // Chinese
  chinese: {
    api: "China",
    display: "Chinese",
  },
  china: {
    api: "China",
    display: "Chinese",
  },

  // Croatian
  croatian: {
    api: "Croatia",
    display: "Croatian",
  },
  croatia: {
    api: "Croatia",
    display: "Croatian",
  },

  // Dutch
  dutch: {
    api: "Netherlands",
    display: "Dutch",
  },
  netherlands: {
    api: "Netherlands",
    display: "Dutch",
  },

  // Egyptian
  egyptian: {
    api: "Egypt",
    display: "Egyptian",
  },
  egypt: {
    api: "Egypt",
    display: "Egyptian",
  },

  // Filipino
  filipino: {
    api: "Philippines",
    display: "Filipino",
  },
  philippines: {
    api: "Philippines",
    display: "Filipino",
  },

  // French
  french: {
    api: "France",
    display: "French",
  },
  france: {
    api: "France",
    display: "French",
  },

  // Greek
  greek: {
    api: "Greece",
    display: "Greek",
  },
  greece: {
    api: "Greece",
    display: "Greek",
  },

  // Indian
  indian: {
    api: "India",
    display: "Indian",
  },
  india: {
    api: "India",
    display: "Indian",
  },

  // Irish
  irish: {
    api: "Ireland",
    display: "Irish",
  },
  ireland: {
    api: "Ireland",
    display: "Irish",
  },

  // Italian
  italian: {
    api: "Italy",
    display: "Italian",
  },
  italy: {
    api: "Italy",
    display: "Italian",
  },

  // Jamaican
  jamaican: {
    api: "Jamaica",
    display: "Jamaican",
  },
  jamaica: {
    api: "Jamaica",
    display: "Jamaican",
  },

  // Japanese
  japanese: {
    api: "Japan",
    display: "Japanese",
  },
  japan: {
    api: "Japan",
    display: "Japanese",
  },

  // Kenyan
  kenyan: {
    api: "Kenya",
    display: "Kenyan",
  },
  kenya: {
    api: "Kenya",
    display: "Kenyan",
  },

  // Malaysian
  malaysian: {
    api: "Malaysia",
    display: "Malaysian",
  },
  malaysia: {
    api: "Malaysia",
    display: "Malaysian",
  },

  // Mexican
  mexican: {
    api: "Mexico",
    display: "Mexican",
  },
  mexico: {
    api: "Mexico",
    display: "Mexican",
  },

  // Moroccan
  moroccan: {
    api: "Morocco",
    display: "Moroccan",
  },
  morocco: {
    api: "Morocco",
    display: "Moroccan",
  },

  // Polish
  polish: {
    api: "Poland",
    display: "Polish",
  },
  poland: {
    api: "Poland",
    display: "Polish",
  },

  // Portuguese
  portuguese: {
    api: "Portugal",
    display: "Portuguese",
  },
  portugal: {
    api: "Portugal",
    display: "Portuguese",
  },

  // Russian
  russian: {
    api: "Russia",
    display: "Russian",
  },
  russia: {
    api: "Russia",
    display: "Russian",
  },

  // Spanish
  spanish: {
    api: "Spain",
    display: "Spanish",
  },
  spain: {
    api: "Spain",
    display: "Spanish",
  },

  // Thai
  thai: {
    api: "Thailand",
    display: "Thai",
  },
  thailand: {
    api: "Thailand",
    display: "Thai",
  },

  // Tunisian
  tunisian: {
    api: "Tunisia",
    display: "Tunisian",
  },
  tunisia: {
    api: "Tunisia",
    display: "Tunisian",
  },

  // Turkish
  turkish: {
    api: "Turkey",
    display: "Turkish",
  },
  turkey: {
    api: "Turkey",
    display: "Turkish",
  },

  // Ukrainian
  ukrainian: {
    api: "Ukraine",
    display: "Ukrainian",
  },
  ukraine: {
    api: "Ukraine",
    display: "Ukrainian",
  },

  // Vietnamese
  vietnamese: {
    api: "Vietnam",
    display: "Vietnamese",
  },
  vietnam: {
    api: "Vietnam",
    display: "Vietnamese",
  },

  // Algerian
  algerian: {
    api: "Algeria",
    display: "Algerian",
  },
  algeria: {
    api: "Algeria",
    display: "Algerian",
  },

  // Argentine
  argentine: {
    api: "Argentina",
    display: "Argentine",
  },
  argentina: {
    api: "Argentina",
    display: "Argentine",
  },

  // Australian
  australian: {
    api: "Australia",
    display: "Australian",
  },
  australia: {
    api: "Australia",
    display: "Australian",
  },

  // Norwegian
  norwegian: {
    api: "Norway",
    display: "Norwegian",
  },
  norway: {
    api: "Norway",
    display: "Norwegian",
  },

  // Slovak
  slovak: {
    api: "Slovakia",
    display: "Slovak",
  },
  slovakia: {
    api: "Slovakia",
    display: "Slovak",
  },

  // Syrian
  syrian: {
    api: "Syria",
    display: "Syrian",
  },
  syria: {
    api: "Syria",
    display: "Syrian",
  },

  // Uruguayan
  uruguayan: {
    api: "Uruguay",
    display: "Uruguayan",
  },
  uruguay: {
    api: "Uruguay",
    display: "Uruguayan",
  },

  // Venezuelan
  venezuelan: {
    api: "Venezuela",
    display: "Venezuelan",
  },
  venezuela: {
    api: "Venezuela",
    display: "Venezuelan",
  },

  // Saudi Arabian
  "saudi-arabian": {
    api: "Saudi Arabia",
    display: "Saudi Arabian",
  },
  "saudi-arabia": {
    api: "Saudi Arabia",
    display: "Saudi Arabian",
  },
};
