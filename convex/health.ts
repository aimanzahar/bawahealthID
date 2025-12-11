import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const updateHealthProfile = mutation({
  args: {
    userId: v.id("users"),
    dateOfBirth: v.string(),
    gender: v.string(),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalConditions: v.optional(v.array(v.string())),
    emergencyContactName: v.string(),
    emergencyContactPhone: v.string(),
    emergencyContactRelation: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, ...healthData } = args;

    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      ...healthData,
      profileCompleted: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getHealthProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      bloodType: user.bloodType,
      allergies: user.allergies || [],
      medicalConditions: user.medicalConditions || [],
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      emergencyContactRelation: user.emergencyContactRelation,
      profileCompleted: user.profileCompleted,
      verificationStatus: user.verificationStatus,
    };
  },
});

export const checkProfileCompletion = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { completed: false };
    }

    return {
      completed: user.profileCompleted || false,
      verificationStatus: user.verificationStatus || "not-verified",
    };
  },
});