import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(), // In production, this should be hashed
    name: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    nricNumber: v.optional(v.string()),
    myDigitalIdVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phoneNumber"]),

  myDigitalIdApplications: defineTable({
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
    verificationStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    applicationDate: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["verificationStatus"]),
});