import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all hospitals
export const getAllHospitals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("hospitals").collect();
  },
});

// Query: Get hospitals by state (for filtering)
export const getHospitalsByState = query({
  args: {
    state: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hospitals")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .collect();
  },
});

// Query: Get hospitals by city
export const getHospitalsByCity = query({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hospitals")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();
  },
});

// Query: Get hospitals with emergency services
export const getEmergencyHospitals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("hospitals")
      .withIndex("by_emergency", (q) => q.eq("hasEmergency", true))
      .collect();
  },
});

// Query: Search hospitals by name
export const searchHospitals = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allHospitals = await ctx.db.query("hospitals").collect();
    const searchLower = args.searchTerm.toLowerCase();
    
    return allHospitals.filter((hospital) =>
      hospital.name.toLowerCase().includes(searchLower) ||
      hospital.city.toLowerCase().includes(searchLower) ||
      hospital.state.toLowerCase().includes(searchLower)
    );
  },
});

// Query: Get single hospital by ID
export const getHospitalById = query({
  args: {
    id: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get hospitals by type
export const getHospitalsByType = query({
  args: {
    type: v.union(
      v.literal("government"),
      v.literal("private"),
      v.literal("clinic"),
      v.literal("specialist")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hospitals")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// Mutation: Add hospital (for seeding/admin)
export const addHospital = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("government"),
      v.literal("private"),
      v.literal("clinic"),
      v.literal("specialist")
    ),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    phoneNumber: v.optional(v.string()),
    emergencyNumber: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    operatingHours: v.optional(v.string()),
    is24Hours: v.boolean(),
    hasEmergency: v.boolean(),
    specialties: v.optional(v.array(v.string())),
    facilities: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const hospitalId = await ctx.db.insert("hospitals", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return hospitalId;
  },
});

// Mutation: Update hospital
export const updateHospital = mutation({
  args: {
    id: v.id("hospitals"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("government"),
        v.literal("private"),
        v.literal("clinic"),
        v.literal("specialist")
      )
    ),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    phoneNumber: v.optional(v.string()),
    emergencyNumber: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    operatingHours: v.optional(v.string()),
    is24Hours: v.optional(v.boolean()),
    hasEmergency: v.optional(v.boolean()),
    specialties: v.optional(v.array(v.string())),
    facilities: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify hospital exists
    const hospital = await ctx.db.get(id);
    if (!hospital) {
      throw new Error("Hospital not found");
    }

    // Filter out undefined values and add updatedAt
    const filteredUpdates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, filteredUpdates);

    return { success: true };
  },
});

// Mutation: Delete hospital
export const deleteHospital = mutation({
  args: {
    id: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    // Verify hospital exists
    const hospital = await ctx.db.get(args.id);
    if (!hospital) {
      throw new Error("Hospital not found");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});