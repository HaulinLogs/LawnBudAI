/**
 * Grass Variety Catalog
 *
 * Consumer-friendly grass variety data aligned with real seed-bag terminology
 * from Scotts, Pennington, Jonathan Green, and GreenView product lines.
 *
 * IDs for seeded varieties intentionally match the GrassSeedType union in
 * lawnAdvice.ts so that variety selection integrates cleanly with the
 * germination and overseeding logic added there.
 *
 * References:
 *  - Scotts Miracle-Gro product line: https://www.scotts.com/en-us/products/grass-seed
 *  - Pennington Smart Seed line: https://www.pennington.com/all-products/grass-seed
 *  - Jonathan Green product line: https://www.jonathangreen.com/grass-seed
 *  - USDA NRCS Plant Guide: https://plants.usda.gov/
 */

import { type GrassType } from '@/lib/lawnAdvice';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Consumer-facing sunlight category matching real seed-bag labels. */
export type SunExposure = 'full_sun' | 'sun_and_shade' | 'dense_shade';

/** Broad soil texture categories used to tailor watering advice. */
export type SoilType = 'sandy' | 'loamy' | 'clay';

/**
 * Unique variety identifiers. Seeded varieties use the same IDs as
 * GrassSeedType in lawnAdvice.ts for interoperability.
 */
export type GrassVarietyId =
  | 'kentucky_bluegrass'
  | 'tall_fescue'
  | 'perennial_ryegrass'
  | 'fine_fescue'
  | 'creeping_red_fescue'
  | 'bermudagrass'
  | 'zoysiagrass'
  | 'st_augustine'
  | 'centipede'
  | 'buffalo_grass';

export interface GrassVariety {
  /** Unique identifier — matches GrassSeedType IDs where the variety can be seeded */
  id: GrassVarietyId;
  /** Plain-English display name shown in UI and store tips */
  displayName: string;
  /** Maps to GrassType for use with the existing advice engine */
  grassType: GrassType;
  /** Sunlight categories this variety thrives in */
  sunExposure: SunExposure[];
  /** Soil textures this variety prefers */
  soilPreference: SoilType[];
  /** USDA climate categories where this variety performs well */
  regions: string[];
  /** Recommended mowing height range in inches [min, max] */
  mowHeightRange: [number, number];
  /** 1–2 sentence plain-English description of the variety */
  description: string;
  /** Store tip matching seed-bag label language */
  storeTip: string;
  /** Real product names (no prices or retailer links — they go stale) */
  exampleProducts: string[];
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const GRASS_VARIETIES: GrassVariety[] = [
  // --- Cool-season -----------------------------------------------------------

  {
    id: 'kentucky_bluegrass',
    displayName: 'Kentucky Bluegrass',
    grassType: 'cool_season',
    sunExposure: ['full_sun'],
    soilPreference: ['loamy', 'clay'],
    regions: ['cold', 'cool'],
    mowHeightRange: [2.5, 3.5],
    description:
      'The classic Northern lawn grass — dense, dark green, and self-repairing. Slow to germinate but forms a beautiful carpet once established.',
    storeTip:
      'Look for bags labeled "Kentucky Bluegrass" or a "Full Sun" blend. Scotts and Pennington both sell straight bluegrass bags.',
    exampleProducts: [
      'Scotts Turf Builder Kentucky Bluegrass',
      'Pennington Smart Seed Kentucky Bluegrass',
    ],
  },

  {
    id: 'tall_fescue',
    displayName: 'Tall Fescue',
    grassType: 'cool_season',
    sunExposure: ['sun_and_shade'],
    soilPreference: ['loamy', 'clay', 'sandy'],
    regions: ['cool', 'transition'],
    mowHeightRange: [3, 4],
    description:
      'The most versatile cool-season grass — tolerates heat, shade, and foot traffic better than bluegrass. The backbone of most "Sun & Shade" mixes.',
    storeTip:
      'Look for bags labeled "Sun & Shade Mix." Nearly every Sun & Shade product is primarily Tall Fescue blended with Kentucky Bluegrass and Ryegrass.',
    exampleProducts: [
      'Scotts Turf Builder Sun & Shade Mix',
      'Pennington Smart Seed Sun & Shade',
      'Jonathan Green Black Beauty Ultra',
      'GreenView Fairway Formula',
    ],
  },

  {
    id: 'perennial_ryegrass',
    displayName: 'Perennial Ryegrass',
    grassType: 'cool_season',
    sunExposure: ['full_sun', 'sun_and_shade'],
    soilPreference: ['loamy'],
    regions: ['cool', 'transition'],
    mowHeightRange: [2.5, 3.5],
    description:
      'Germinates in 5–10 days — the fastest cool-season grass. Common in blended mixes for quick cover while slower grasses establish.',
    storeTip:
      'Perennial Ryegrass is rarely sold alone for lawns — it is blended into most Sun & Shade and full-sun products. Check the ingredient list on the back of the bag.',
    exampleProducts: [
      'Scotts Turf Builder Sun & Shade Mix',
      'Pennington Smart Seed Sun & Shade',
      'Jonathan Green Black Beauty Ultra',
    ],
  },

  {
    id: 'fine_fescue',
    displayName: 'Fine Fescue (Shade Mix)',
    grassType: 'cool_season',
    sunExposure: ['sun_and_shade', 'dense_shade'],
    soilPreference: ['sandy', 'loamy'],
    regions: ['cold', 'cool'],
    mowHeightRange: [3.5, 4.5],
    description:
      'A family of fine-bladed, shade-tolerant grasses (Chewings, Hard, Sheep fescue) sold as "Dense Shade" mixes. Low maintenance and drought-tolerant once established.',
    storeTip:
      'Look for bags labeled "Dense Shade" or "Shade Mix." The ingredient list will show Chewings Fescue, Hard Fescue, or Sheep Fescue.',
    exampleProducts: [
      'Scotts Turf Builder Dense Shade',
      'Pennington Smart Seed Dense Shade',
      'Jonathan Green Dense Shade',
    ],
  },

  {
    id: 'creeping_red_fescue',
    displayName: 'Creeping Red Fescue',
    grassType: 'cool_season',
    sunExposure: ['dense_shade'],
    soilPreference: ['sandy', 'loamy'],
    regions: ['cold', 'cool'],
    mowHeightRange: [3.5, 4.5],
    description:
      'The most shade-tolerant cool-season grass — thrives under dense tree canopy where other grasses fail. Spreads slowly by rhizomes.',
    storeTip:
      'Look for bags labeled "Dense Shade" — Creeping Red Fescue appears alongside Chewings Fescue in most dense shade blends.',
    exampleProducts: [
      'Scotts Turf Builder Dense Shade',
      'Pennington Smart Seed Dense Shade',
    ],
  },

  // --- Warm-season -----------------------------------------------------------

  {
    id: 'bermudagrass',
    displayName: 'Bermudagrass',
    grassType: 'warm_season',
    sunExposure: ['full_sun'],
    soilPreference: ['loamy', 'sandy'],
    regions: ['transition', 'warm', 'tropical'],
    mowHeightRange: [0.5, 1.5],
    description:
      'The premier full-sun warm-season grass — tough, fast-spreading, and golf-course dense when maintained properly. Goes dormant (brown) in winter.',
    storeTip:
      'Look for "Bermudagrass" seed bags. Scotts EZ Seed Bermudagrass is a common big-box option that includes mulch and fertilizer.',
    exampleProducts: [
      'Scotts EZ Seed Bermudagrass',
      'Pennington Bermudagrass',
      'Scotts Turf Builder Bermudagrass',
    ],
  },

  {
    id: 'zoysiagrass',
    displayName: 'Zoysia Grass',
    grassType: 'warm_season',
    sunExposure: ['full_sun', 'sun_and_shade'],
    soilPreference: ['loamy', 'clay'],
    regions: ['transition', 'warm'],
    mowHeightRange: [1, 2],
    description:
      'Dense, carpet-like warm-season grass with good shade tolerance for a warm-season variety. Slow-growing but requires less mowing once established.',
    storeTip:
      'Look for "Zoysia" seed bags. Scotts EZ Seed Zoysia is widely available. Note: Zoysia grows slowly from seed — plugs or sod establish faster.',
    exampleProducts: [
      'Scotts EZ Seed Zoysia',
      'Pennington Zenith Zoysia',
    ],
  },

  {
    id: 'st_augustine',
    displayName: 'St. Augustine Grass',
    grassType: 'warm_season',
    sunExposure: ['sun_and_shade', 'dense_shade'],
    soilPreference: ['loamy', 'sandy'],
    regions: ['warm', 'tropical'],
    mowHeightRange: [3.5, 4],
    description:
      'The standard lawn grass of the Gulf Coast and Florida — broad-bladed, shade-tolerant for a warm-season variety, and lush when watered well.',
    storeTip:
      'St. Augustine is not available as seed — it must be established from sod or plugs. Ask for "St. Augustine sod" at your local garden center.',
    exampleProducts: [
      'Floratam St. Augustine Sod (most common variety)',
      'Palmetto St. Augustine Sod (better shade tolerance)',
    ],
  },

  {
    id: 'centipede',
    displayName: 'Centipede Grass',
    grassType: 'warm_season',
    sunExposure: ['full_sun', 'sun_and_shade'],
    soilPreference: ['sandy', 'loamy'],
    regions: ['warm'],
    mowHeightRange: [1.5, 2],
    description:
      'Low-maintenance warm-season grass popular in the Southeast. Prefers acidic sandy soils and requires minimal fertilizer — avoid over-feeding.',
    storeTip:
      'Look for "Centipede" seed bags. Pennington Centipede Grass Seed is a common option. Also available as sod for faster establishment.',
    exampleProducts: [
      'Pennington Centipede Grass Seed',
      'Gulf Kist Centipede Grass Seed',
    ],
  },

  {
    id: 'buffalo_grass',
    displayName: 'Buffalo Grass',
    grassType: 'warm_season',
    sunExposure: ['full_sun'],
    soilPreference: ['loamy', 'clay'],
    regions: ['transition', 'warm'],
    mowHeightRange: [2, 3],
    description:
      'Native Great Plains grass — ultra-low water use and very low maintenance. Goes dormant (brown) in hot dry summers and again in winter.',
    storeTip:
      'Look for "Buffalo Grass" seed or plugs at specialty lawn and garden stores. Not commonly stocked at big-box retailers — try local nurseries or online.',
    exampleProducts: [
      'Buffalograss 609 Seed',
      'Prairie Buffalo Grass Seed',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Returns varieties suitable for the given USDA climate category, optionally
 * filtered by the consumer-facing sun exposure label.
 */
export function getVarietiesForZone(
  climateCategory: string,
  sunExposure?: SunExposure,
): GrassVariety[] {
  return GRASS_VARIETIES.filter((v) => {
    if (!v.regions.includes(climateCategory)) return false;
    if (sunExposure && !v.sunExposure.includes(sunExposure)) return false;
    return true;
  });
}

/**
 * Returns the GrassType for a variety, enabling the existing advice engine
 * (getMowingAdvice, getWateringAdvice, getFertilizerAdvisory) to work
 * without modification. Falls back to 'mixed' for unrecognised IDs.
 */
export function getGrassTypeForVariety(varietyId: string): GrassType {
  const variety = GRASS_VARIETIES.find((v) => v.id === varietyId);
  return variety?.grassType ?? 'mixed';
}

/**
 * Returns the mowing height range [min, max] in inches for a specific variety,
 * or null if the variety ID is not recognised.
 */
export function getMowHeightForVariety(varietyId: string): [number, number] | null {
  const variety = GRASS_VARIETIES.find((v) => v.id === varietyId);
  return variety?.mowHeightRange ?? null;
}
