import { query } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════
// UI Catalog Queries (selectors / lists)
// ═══════════════════════════════════════════════════════════════

/** All amp models from the catalog. */
export const getAmps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ampList").collect();
  },
});

/** All FX pedals from the catalog. */
export const getPedals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fxPedalList").collect();
  },
});

/** All cabinets with their speaker references. */
export const getCabinets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cabList").collect();
  },
});

/** All microphones from the catalog. */
export const getMics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("micList").collect();
  },
});

// ═══════════════════════════════════════════════════════════════
// DSP Data Queries (tone values fed into AudioWorklet processors)
// ═══════════════════════════════════════════════════════════════

/** Manufacturer tone stack values for a specific amp (bass/mid/treble/presence/resonance). */
export const getAmpToneStack = query({
  args: { ampId: v.id("ampList") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ampManufacturerToneValues")
      .withIndex("by_amp", (q) => q.eq("ampId", args.ampId))
      .unique();
  },
});

/** Preamp tube stage data for a specific amp (per-stage gain + frequency response). */
export const getPreampStages = query({
  args: { ampId: v.id("ampList") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("preampToneValues")
      .withIndex("by_amp_stage", (q) => q.eq("ampId", args.ampId))
      .collect();
  },
});

/** Power amp tube characteristics for a specific tube type. */
export const getPowerAmpTubeData = query({
  args: { tubeType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("powerAmpToneValues")
      .withIndex("by_tube_type", (q) => q.eq("tubeType", args.tubeType))
      .unique();
  },
});

/** Circuit-level component values for a specific FX pedal. */
export const getPedalCircuit = query({
  args: { pedalId: v.id("fxPedalList") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fxPedalCircuitValues")
      .withIndex("by_pedal", (q) => q.eq("pedalId", args.pedalId))
      .unique();
  },
});

/** Cabinet body tone values (depth, dimension, air simulation). */
export const getCabinetTone = query({
  args: { cabId: v.id("cabList") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cabToneValues")
      .withIndex("by_cab", (q) => q.eq("cabId", args.cabId))
      .unique();
  },
});

/** Combined IR data for a specific cabinet. */
export const getCabinetIR = query({
  args: { cabId: v.id("cabList") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cabCombinedValues")
      .withIndex("by_cab", (q) => q.eq("cabId", args.cabId))
      .unique();
  },
});

/** Speaker frequency spectrum and impedance curve. */
export const getSpeakerTone = query({
  args: { speakerId: v.id("speakerList") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("speakerToneValues")
      .withIndex("by_speaker", (q) => q.eq("speakerId", args.speakerId))
      .unique();
  },
});

/** Mic manufacturer frequency response, polar pattern, sensitivity. */
export const getMicToneData = query({
  args: { micId: v.id("micList") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("micTypeToneValues")
      .withIndex("by_mic", (q) => q.eq("micId", args.micId))
      .unique();
  },
});

/** All speakers (for cabinet detail views). */
export const getSpeakers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("speakerList").collect();
  },
});

/** All power amp tube type data (for reference/display). */
export const getAllPowerAmpTubes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("powerAmpToneValues").collect();
  },
});
