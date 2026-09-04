import { ENV } from "./env.js";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "DRY_RUN",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),

    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export default aj;
