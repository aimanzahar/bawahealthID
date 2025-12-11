import { ConvexClient } from "convex/browser";
import { CONVEX_SELF_HOSTED_URL, CONVEX_SELF_HOSTED_ADMIN_KEY } from "@env";

// Direct connection to self-hosted Convex
const CONVEX_URL = CONVEX_SELF_HOSTED_URL;
const CONVEX_ADMIN_KEY = CONVEX_SELF_HOSTED_ADMIN_KEY;

// Create and export the convex client with proper configuration
export const convex = new ConvexClient(CONVEX_URL, {
  adminKey: CONVEX_ADMIN_KEY,
});