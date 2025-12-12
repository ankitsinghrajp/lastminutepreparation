// inngest/route.js
import { serve } from "inngest/express";
import { inngest } from "../libs/inngest.js";
import { lastNightSummaryFn } from "./functions/last-night-summary.js";
export const inngestHandler = serve({
  client: inngest,
  functions: [lastNightSummaryFn],
});
