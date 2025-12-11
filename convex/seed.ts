import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedTestData = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a test user with health profile data
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name || "Test User",
      phoneNumber: "01234567890",
      nricNumber: "920101011234",
      myDigitalIdVerified: false,
      dateOfBirth: "01/01/1992",
      gender: "Male",
      bloodType: "O+",
      allergies: ["Penicillin"],
      medicalConditions: ["Hypertension"],
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "01234567891",
      emergencyContactRelation: "Spouse",
      profileCompleted: true,
      verificationStatus: "not-verified",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const clearAllData = mutation({
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    // Delete all users
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // Get all MyDigital ID applications
    const applications = await ctx.db.query("myDigitalIdApplications").collect();

    // Delete all applications
    for (const app of applications) {
      await ctx.db.delete(app._id);
    }

    return { usersDeleted: users.length, applicationsDeleted: applications.length };
  },
});