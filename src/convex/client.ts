import { ConvexClient } from "convex/browser";

// Direct connection to self-hosted Convex
const CONVEX_URL = "https://convex.zahar.my";
const CONVEX_ADMIN_KEY = "convex-self-hosted|01035e145371903f8399f71c5de91733df6ed7bcbd61ff5bbff8d91aac855f9834780ee716";

// Create and export the convex client with proper configuration
export const convex = new ConvexClient(CONVEX_URL, {
  adminKey: CONVEX_ADMIN_KEY,
});