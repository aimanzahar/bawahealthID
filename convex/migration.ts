import { v } from "convex/values";
import { mutation } from "./_generated/server";

// One-time migration to add missing fields to existing users
export const migrateExistingUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (user.profileCompleted === undefined) {
        await ctx.db.patch(user._id, {
          profileCompleted: false,
          verificationStatus: user.myDigitalIdVerified ? "verified" : "not-verified",
        });
      }
    }

    return { migrated: users.length };
  },
});