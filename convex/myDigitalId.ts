import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createApplication = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    nricNumber: v.string(),
    dateOfBirth: v.string(),
    gender: v.string(),
    nationality: v.string(),
    address: v.string(),
    city: v.string(),
    postalCode: v.string(),
    state: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if there's already a pending application
    const existingApplication = await ctx.db
      .query("myDigitalIdApplications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("verificationStatus"), "pending"))
      .first();

    if (existingApplication) {
      throw new Error("You already have a pending application");
    }

    // Create new application
    const applicationId = await ctx.db.insert("myDigitalIdApplications", {
      ...args,
      verificationStatus: "pending",
      applicationDate: Date.now(),
    });

    // Update user with phone number if not already set, and set verification status to pending
    const user = await ctx.db.get(args.userId);
    if (user) {
      const updateFields: Record<string, any> = {
        verificationStatus: "pending",
        updatedAt: Date.now(),
      };
      if (!user.phoneNumber) {
        updateFields.phoneNumber = args.phoneNumber;
      }
      await ctx.db.patch(args.userId, updateFields);
    }

    return applicationId;
  },
});

export const getApplicationByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("myDigitalIdApplications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return applications;
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("myDigitalIdApplications"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewedBy: v.id("users"),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      verificationStatus: args.status,
      reviewedAt: Date.now(),
      reviewedBy: args.reviewedBy,
    };

    if (args.rejectionReason) {
      updateData.rejectionReason = args.rejectionReason;
    }

    await ctx.db.patch(args.applicationId, updateData);

    // If approved, update user's verification status
    if (args.status === "approved") {
      const application = await ctx.db.get(args.applicationId);
      if (application) {
        await ctx.db.patch(application.userId, {
          myDigitalIdVerified: true,
          verificationStatus: "verified",
          nricNumber: application.nricNumber,
          updatedAt: Date.now(),
        });
      }
    }
  },
});