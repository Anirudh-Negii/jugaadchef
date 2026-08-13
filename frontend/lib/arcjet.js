import arcjet from "@arcjet/next";

export const aj = arcjet({
  key: process.env.NEXT_PUBLIC_ARCJET_KEY,
  rules: [],
});

// Free tier pantry scan limit (10 scans per month)
export const freePantryScan = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["userId"],
    refillRate: 10,
    interval: "30d",
    capacity: 10,
  }),
);

// Free meal recommendation limit (5 recommendations per month)
export const freeMealRecommendation = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["userId"],
    refillRate: 5,
    interval: "30d",
    capacity: 5,
  }),
);

// Pro tier limit (100 tokens per day)
export const proTierLimit = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["userId"],
    refillRate: 100,
    interval: "1d",
    capacity: 100,
  }),
);
