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
    // Health profile fields
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalConditions: v.optional(v.array(v.string())),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelation: v.optional(v.string()),
    // Profile completion tracking
    profileCompleted: v.optional(v.boolean()),
    // Verification status
    verificationStatus: v.optional(v.union(v.literal("not-verified"), v.literal("verified"), v.literal("pending"))),
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
    .index("by_status", ["verificationStatus"])
    .index("by_nric", ["nricNumber"]),
});