/**
 * USDA Plant Hardiness Zone Lookup Service
 *
 * Maps US city/state to USDA hardiness zones based on the 2023 USDA Plant
 * Hardiness Zone Map. Zones determine average annual extreme minimum temperatures
 * and are the foundation for understanding local growing seasons and frost dates.
 *
 * Zone data derived from:
 *   - USDA ARS Plant Hardiness Zone Map (2023): https://planthardiness.ars.usda.gov/
 *   - State extension service publications
 *
 * NOTE: Zones vary within states (elevation, coastal vs inland, urban heat islands).
 * This service provides representative zones for the most common location in each
 * state, with city-level overrides for major metros that differ significantly.
 */

import { type GrassType } from '@/lib/lawnAdvice';

export interface UsdaZoneInfo {
  /** Zone number, e.g. 5 */
  zone: number;
  /** Zone sub-letter, e.g. 'a' or 'b' */
  subzone: 'a' | 'b';
  /** Formatted label, e.g. "Zone 5b" */
  label: string;
  /** Short human-readable climate description */
  description: string;
  /** Broad climate grouping for advice logic */
  climateCategory: 'cold' | 'cool' | 'transition' | 'warm' | 'tropical';
  /** Typical first fall frost window */
  typicalFirstFrost: string;
  /** Typical last spring frost window */
  typicalLastFrost: string;
  /** Best-fit grass type for this zone */
  recommendedGrassType: GrassType;
  /** Minimum temperature range in °F for this zone */
  minTempRange: string;
}

export interface NpkRecommendation {
  /** N-P-K ratio string, e.g. "32-0-8" */
  npk: string;
  /** Product description / category name */
  productType: string;
  /** Application rate in lbs per 1,000 sq ft */
  ratePerThousandSqFt: number;
  /** Suggested total lbs given lawn size, or null if size unknown */
  suggestedTotalLbs: number | null;
  /** Season-and-zone-specific tip */
  proTip: string;
  /** 'active' = season is open; 'dormant' = hold off */
  seasonStatus: 'active' | 'dormant';
  /** Days until next recommended application; null if dormant */
  daysUntilDue: number | null;
  /** Human-readable timing label */
  timingLabel: string;
}

// ---------------------------------------------------------------------------
// State → representative USDA zone mapping
// Sources: USDA 2023 map, NC State Extension zone finder
// ---------------------------------------------------------------------------

const STATE_ZONES: Record<string, { zone: number; subzone: 'a' | 'b' }> = {
  AK: { zone: 3, subzone: 'b' },
  AL: { zone: 8, subzone: 'a' },
  AR: { zone: 7, subzone: 'b' },
  AZ: { zone: 9, subzone: 'b' },
  CA: { zone: 9, subzone: 'b' },
  CO: { zone: 5, subzone: 'b' },
  CT: { zone: 6, subzone: 'b' },
  DC: { zone: 7, subzone: 'a' },
  DE: { zone: 7, subzone: 'a' },
  FL: { zone: 9, subzone: 'b' },
  GA: { zone: 8, subzone: 'a' },
  HI: { zone: 11, subzone: 'b' },
  IA: { zone: 5, subzone: 'a' },
  ID: { zone: 6, subzone: 'a' },
  IL: { zone: 5, subzone: 'b' },
  IN: { zone: 6, subzone: 'a' },
  KS: { zone: 6, subzone: 'a' },
  KY: { zone: 6, subzone: 'b' },
  LA: { zone: 8, subzone: 'b' },
  MA: { zone: 6, subzone: 'a' },
  MD: { zone: 7, subzone: 'a' },
  ME: { zone: 5, subzone: 'a' },
  MI: { zone: 5, subzone: 'b' },
  MN: { zone: 4, subzone: 'b' },
  MO: { zone: 6, subzone: 'b' },
  MS: { zone: 8, subzone: 'a' },
  MT: { zone: 4, subzone: 'b' },
  NC: { zone: 7, subzone: 'b' },
  ND: { zone: 4, subzone: 'a' },
  NE: { zone: 5, subzone: 'a' },
  NH: { zone: 5, subzone: 'b' },
  NJ: { zone: 6, subzone: 'b' },
  NM: { zone: 7, subzone: 'a' },
  NV: { zone: 7, subzone: 'a' },
  NY: { zone: 6, subzone: 'a' },
  OH: { zone: 6, subzone: 'a' },
  OK: { zone: 7, subzone: 'a' },
  OR: { zone: 7, subzone: 'b' },
  PA: { zone: 6, subzone: 'a' },
  RI: { zone: 6, subzone: 'b' },
  SC: { zone: 8, subzone: 'a' },
  SD: { zone: 4, subzone: 'b' },
  TN: { zone: 7, subzone: 'a' },
  TX: { zone: 8, subzone: 'a' },
  UT: { zone: 6, subzone: 'b' },
  VA: { zone: 7, subzone: 'a' },
  VT: { zone: 5, subzone: 'a' },
  WA: { zone: 8, subzone: 'b' },
  WI: { zone: 5, subzone: 'a' },
  WV: { zone: 6, subzone: 'a' },
  WY: { zone: 4, subzone: 'b' },
};

// ---------------------------------------------------------------------------
// City-level zone overrides (normalized to lowercase for case-insensitive match)
// ---------------------------------------------------------------------------

const CITY_ZONE_OVERRIDES: Record<string, Record<string, { zone: number; subzone: 'a' | 'b' }>> = {
  AK: {
    anchorage: { zone: 4, subzone: 'b' },
    fairbanks: { zone: 2, subzone: 'b' },
    juneau: { zone: 7, subzone: 'a' },
  },
  AZ: {
    phoenix: { zone: 10, subzone: 'a' },
    tucson: { zone: 9, subzone: 'a' },
    flagstaff: { zone: 6, subzone: 'a' },
    yuma: { zone: 10, subzone: 'b' },
  },
  CA: {
    'san diego': { zone: 10, subzone: 'b' },
    'los angeles': { zone: 10, subzone: 'a' },
    'san francisco': { zone: 10, subzone: 'b' },
    sacramento: { zone: 9, subzone: 'b' },
    fresno: { zone: 9, subzone: 'b' },
    'lake tahoe': { zone: 7, subzone: 'a' },
    mammoth: { zone: 4, subzone: 'b' },
    eureka: { zone: 9, subzone: 'b' },
  },
  CO: {
    denver: { zone: 6, subzone: 'a' },
    'colorado springs': { zone: 5, subzone: 'b' },
    aspen: { zone: 4, subzone: 'a' },
    pueblo: { zone: 6, subzone: 'b' },
    'fort collins': { zone: 5, subzone: 'b' },
  },
  FL: {
    miami: { zone: 11, subzone: 'a' },
    tampa: { zone: 9, subzone: 'b' },
    orlando: { zone: 9, subzone: 'b' },
    jacksonville: { zone: 9, subzone: 'a' },
    pensacola: { zone: 8, subzone: 'b' },
    'fort lauderdale': { zone: 10, subzone: 'b' },
  },
  GA: {
    atlanta: { zone: 7, subzone: 'b' },
    savannah: { zone: 8, subzone: 'b' },
    macon: { zone: 8, subzone: 'a' },
  },
  HI: {
    honolulu: { zone: 12, subzone: 'a' },
    hilo: { zone: 12, subzone: 'a' },
    kailua: { zone: 12, subzone: 'b' },
  },
  ID: {
    boise: { zone: 6, subzone: 'b' },
    'coeur d\'alene': { zone: 6, subzone: 'a' },
    'sun valley': { zone: 4, subzone: 'b' },
  },
  IL: {
    chicago: { zone: 6, subzone: 'a' },
    springfield: { zone: 5, subzone: 'b' },
    peoria: { zone: 5, subzone: 'b' },
  },
  MN: {
    minneapolis: { zone: 4, subzone: 'b' },
    'saint paul': { zone: 4, subzone: 'b' },
    'st. paul': { zone: 4, subzone: 'b' },
    duluth: { zone: 4, subzone: 'a' },
    rochester: { zone: 4, subzone: 'b' },
  },
  MT: {
    billings: { zone: 5, subzone: 'a' },
    missoula: { zone: 5, subzone: 'a' },
    helena: { zone: 4, subzone: 'b' },
  },
  NC: {
    charlotte: { zone: 7, subzone: 'b' },
    raleigh: { zone: 7, subzone: 'b' },
    asheville: { zone: 6, subzone: 'b' },
    wilmington: { zone: 8, subzone: 'a' },
  },
  NY: {
    'new york': { zone: 7, subzone: 'b' },
    'new york city': { zone: 7, subzone: 'b' },
    nyc: { zone: 7, subzone: 'b' },
    buffalo: { zone: 6, subzone: 'a' },
    albany: { zone: 5, subzone: 'b' },
    syracuse: { zone: 5, subzone: 'b' },
  },
  OR: {
    portland: { zone: 8, subzone: 'b' },
    bend: { zone: 6, subzone: 'a' },
    eugene: { zone: 8, subzone: 'a' },
    medford: { zone: 8, subzone: 'a' },
  },
  PA: {
    philadelphia: { zone: 7, subzone: 'a' },
    pittsburgh: { zone: 6, subzone: 'a' },
  },
  TN: {
    nashville: { zone: 7, subzone: 'a' },
    memphis: { zone: 7, subzone: 'b' },
    knoxville: { zone: 7, subzone: 'a' },
    chattanooga: { zone: 7, subzone: 'b' },
  },
  TX: {
    dallas: { zone: 8, subzone: 'a' },
    houston: { zone: 9, subzone: 'a' },
    'san antonio': { zone: 8, subzone: 'b' },
    austin: { zone: 8, subzone: 'b' },
    'el paso': { zone: 8, subzone: 'a' },
    lubbock: { zone: 7, subzone: 'a' },
    amarillo: { zone: 6, subzone: 'b' },
  },
  VA: {
    richmond: { zone: 7, subzone: 'a' },
    norfolk: { zone: 7, subzone: 'b' },
    'virginia beach': { zone: 7, subzone: 'b' },
    roanoke: { zone: 6, subzone: 'b' },
  },
  WA: {
    seattle: { zone: 8, subzone: 'b' },
    spokane: { zone: 6, subzone: 'b' },
    tacoma: { zone: 8, subzone: 'b' },
    olympia: { zone: 8, subzone: 'a' },
    yakima: { zone: 7, subzone: 'a' },
  },
  WI: {
    madison: { zone: 5, subzone: 'a' },
    milwaukee: { zone: 5, subzone: 'b' },
    'green bay': { zone: 5, subzone: 'a' },
    'eau claire': { zone: 4, subzone: 'b' },
    superior: { zone: 4, subzone: 'a' },
  },
};

// ---------------------------------------------------------------------------
// Zone metadata by zone number
// ---------------------------------------------------------------------------

interface ZoneMeta {
  description: string;
  climateCategory: UsdaZoneInfo['climateCategory'];
  typicalFirstFrost: string;
  typicalLastFrost: string;
  minTempRange: string;
  recommendedGrassType: GrassType;
}

const ZONE_META: Record<number, ZoneMeta> = {
  1: {
    description: 'Subarctic – extreme cold winters, very short growing season',
    climateCategory: 'cold',
    typicalFirstFrost: 'Late July',
    typicalLastFrost: 'Late June',
    minTempRange: 'Below -60°F',
    recommendedGrassType: 'cool_season',
  },
  2: {
    description: 'Very cold – harsh winters, brief summer growing window',
    climateCategory: 'cold',
    typicalFirstFrost: 'Late August',
    typicalLastFrost: 'Late May',
    minTempRange: '-50 to -40°F',
    recommendedGrassType: 'cool_season',
  },
  3: {
    description: 'Cold northern – long winters, short growing season (~90 days)',
    climateCategory: 'cold',
    typicalFirstFrost: 'Late September',
    typicalLastFrost: 'Mid-May',
    minTempRange: '-40 to -30°F',
    recommendedGrassType: 'cool_season',
  },
  4: {
    description: 'Cold – cool-season grasses preferred, ~140 frost-free days',
    climateCategory: 'cold',
    typicalFirstFrost: 'Early October',
    typicalLastFrost: 'Late April',
    minTempRange: '-30 to -20°F',
    recommendedGrassType: 'cool_season',
  },
  5: {
    description: 'Northern cool – cold winters, ~160 frost-free days',
    climateCategory: 'cool',
    typicalFirstFrost: 'Mid-October',
    typicalLastFrost: 'Mid-April',
    minTempRange: '-20 to -10°F',
    recommendedGrassType: 'cool_season',
  },
  6: {
    description: 'Cool-temperate – mild summers, cold winters, ~180 frost-free days',
    climateCategory: 'cool',
    typicalFirstFrost: 'Late October',
    typicalLastFrost: 'Early April',
    minTempRange: '-10 to 0°F',
    recommendedGrassType: 'cool_season',
  },
  7: {
    description: 'Transitional – warm summers, mild winters, cool-season grasses preferred',
    climateCategory: 'transition',
    typicalFirstFrost: 'Early November',
    typicalLastFrost: 'Mid-March',
    minTempRange: '0 to 10°F',
    recommendedGrassType: 'mixed',
  },
  8: {
    description: 'Warm transitional – hot summers, mild winters, warm-season grasses thrive',
    climateCategory: 'warm',
    typicalFirstFrost: 'Mid-November',
    typicalLastFrost: 'Early March',
    minTempRange: '10 to 20°F',
    recommendedGrassType: 'warm_season',
  },
  9: {
    description: 'Subtropical – near year-round growing season for warm-season turf',
    climateCategory: 'warm',
    typicalFirstFrost: 'Late November / rare',
    typicalLastFrost: 'Late February / rare',
    minTempRange: '20 to 30°F',
    recommendedGrassType: 'warm_season',
  },
  10: {
    description: 'Near-tropical – frost uncommon, warm-season grasses grow nearly year-round',
    climateCategory: 'tropical',
    typicalFirstFrost: 'Rarely occurs',
    typicalLastFrost: 'Rarely occurs',
    minTempRange: '30 to 40°F',
    recommendedGrassType: 'warm_season',
  },
  11: {
    description: 'Tropical – no meaningful frost, year-round growing season',
    climateCategory: 'tropical',
    typicalFirstFrost: 'Does not occur',
    typicalLastFrost: 'Does not occur',
    minTempRange: '40 to 50°F',
    recommendedGrassType: 'warm_season',
  },
  12: {
    description: 'Tropical humid – continuous warm-season growth possible',
    climateCategory: 'tropical',
    typicalFirstFrost: 'Does not occur',
    typicalLastFrost: 'Does not occur',
    minTempRange: '50 to 60°F',
    recommendedGrassType: 'warm_season',
  },
  13: {
    description: 'Tropical wet – Hawaii and coastal tropics, year-round lawn growth',
    climateCategory: 'tropical',
    typicalFirstFrost: 'Does not occur',
    typicalLastFrost: 'Does not occur',
    minTempRange: 'Above 60°F',
    recommendedGrassType: 'warm_season',
  },
};

// ---------------------------------------------------------------------------
// NPK schedule by climate category and season
// ---------------------------------------------------------------------------

export interface ZoneNpkSchedule {
  /** N-P-K ratio string */
  npk: string;
  /** Descriptive product name */
  productType: string;
  /** lbs of product per 1,000 sq ft */
  ratePerThousandSqFt: number;
  /** Minimum days between applications; null = dormant/skip */
  minDaysBetween: number | null;
  /** Expert tip for this zone/season combo */
  proTip: string;
}

type ClimateCategory = UsdaZoneInfo['climateCategory'];
type Season = 'spring' | 'summer' | 'fall' | 'winter';

const NPK_BY_CLIMATE_SEASON: Record<ClimateCategory, Record<Season, ZoneNpkSchedule>> = {
  cold: {
    spring: {
      npk: '18-6-12',
      productType: 'Starter / recovery blend',
      ratePerThousandSqFt: 3.0,
      minDaysBetween: 50,
      proTip: 'Wait until soil temps reach 50°F before feeding — cold-zone springs are short; one well-timed application beats two early ones.',
    },
    summer: {
      npk: '0-0-0',
      productType: 'None – dormant period',
      ratePerThousandSqFt: 0,
      minDaysBetween: null,
      proTip: 'Cool-season grasses in cold zones typically go semi-dormant in summer heat. Fertilizing now causes stress and disease risk.',
    },
    fall: {
      npk: '32-0-8',
      productType: 'High-nitrogen winterizer',
      ratePerThousandSqFt: 4.5,
      minDaysBetween: 30,
      proTip: 'Fall is the most important feeding window. Apply 6–8 weeks before ground freeze to build carbohydrate reserves for winter survival.',
    },
    winter: {
      npk: '0-0-0',
      productType: 'None – grass is dormant',
      ratePerThousandSqFt: 0,
      minDaysBetween: null,
      proTip: 'No applications needed. The fall winterizer carries your lawn through the cold months.',
    },
  },
  cool: {
    spring: {
      npk: '15-0-8',
      productType: 'Balanced slow-release',
      ratePerThousandSqFt: 3.5,
      minDaysBetween: 45,
      proTip: 'Light spring feeding only. Heavy nitrogen now causes excessive shoot growth and weakens roots. Prioritize the fall application for cool-zone lawns.',
    },
    summer: {
      npk: '0-0-0',
      productType: 'None – skip summer fertilization',
      ratePerThousandSqFt: 0,
      minDaysBetween: null,
      proTip: 'Avoid fertilizing cool-season grass in summer heat. Feeding now increases disease pressure and wastes product.',
    },
    fall: {
      npk: '32-0-8',
      productType: 'High-nitrogen slow-release winterizer',
      ratePerThousandSqFt: 4.5,
      minDaysBetween: 30,
      proTip: 'September–November is the prime window. A two-application fall program (Labor Day + Halloween) produces the best spring green-up.',
    },
    winter: {
      npk: '0-0-0',
      productType: 'None – grass is dormant',
      ratePerThousandSqFt: 0,
      minDaysBetween: null,
      proTip: 'No applications needed during winter dormancy. Prepare for a light spring feeding once soil temps hit 50°F.',
    },
  },
  transition: {
    spring: {
      npk: '16-4-8',
      productType: 'Balanced NPK with phosphorus',
      ratePerThousandSqFt: 3.5,
      minDaysBetween: 45,
      proTip: 'Transition-zone lawns have both grass types. Feed once cool-season grasses are actively growing (mid-spring) before summer heat arrives.',
    },
    summer: {
      npk: '25-0-12',
      productType: 'Nitrogen-rich with potassium',
      ratePerThousandSqFt: 3.5,
      minDaysBetween: 50,
      proTip: 'In the transition zone, warm-season patches can be fed in summer. Avoid feeding cool-season areas — they are heat-stressed.',
    },
    fall: {
      npk: '24-0-8',
      productType: 'Moderate-nitrogen fall blend',
      ratePerThousandSqFt: 4.0,
      minDaysBetween: 35,
      proTip: 'Fall is critical for cool-season recovery in the transition zone. Apply by early November, 8+ weeks before your first expected frost.',
    },
    winter: {
      npk: '0-0-0',
      productType: 'None – both grass types are resting',
      ratePerThousandSqFt: 0,
      minDaysBetween: null,
      proTip: 'Both cool and warm-season grasses benefit from a winter rest. Resume feeding in mid-spring.',
    },
  },
  warm: {
    spring: {
      npk: '25-0-12',
      productType: 'Balanced NPK with micronutrients',
      ratePerThousandSqFt: 4.0,
      minDaysBetween: 45,
      proTip: 'Wait until grass is fully green and growing before feeding (typically late April–May). Feeding dormant warm-season grass promotes weeds, not turf.',
    },
    summer: {
      npk: '30-0-10',
      productType: 'Nitrogen-rich, low-phosphorus',
      ratePerThousandSqFt: 4.0,
      minDaysBetween: 42,
      proTip: 'Peak growing season for warm-season grasses. Apply every 6–8 weeks, but hold off if the lawn is drought-stressed — water first, then feed.',
    },
    fall: {
      npk: '5-0-20',
      productType: 'Low-N, high-K hardening blend',
      ratePerThousandSqFt: 3.0,
      minDaysBetween: 60,
      proTip: 'Apply 8+ weeks before your expected first frost. High potassium hardens cell walls for cold tolerance. Avoid high-N now — it delays dormancy.',
    },
    winter: {
      npk: '0-0-0',
      productType: 'None – grass is dormant',
      ratePerThousandSqFt: 0,
      minDaysBetween: null,
      proTip: 'Warm-season grasses are dormant. Excess nitrogen on dormant turf feeds winter weeds and diseases. Resume feeding when turf greens up in spring.',
    },
  },
  tropical: {
    spring: {
      npk: '15-5-10',
      productType: 'Balanced tropical blend',
      ratePerThousandSqFt: 3.5,
      minDaysBetween: 60,
      proTip: 'Tropical lawns can be fertilized year-round. Use slow-release formulas to reduce leaching in high-rainfall areas.',
    },
    summer: {
      npk: '15-0-15',
      productType: 'Balanced N-K tropical formula',
      ratePerThousandSqFt: 3.5,
      minDaysBetween: 60,
      proTip: 'High summer rainfall in tropical zones can leach nitrogen quickly. Use slow-release or polymer-coated urea for sustained feeding.',
    },
    fall: {
      npk: '10-0-20',
      productType: 'Lower-N, high-K for tropical turf',
      ratePerThousandSqFt: 3.0,
      minDaysBetween: 60,
      proTip: 'Potassium is especially important in sandy tropical soils. Consider a micronutrient package including iron and manganese.',
    },
    winter: {
      npk: '15-5-10',
      productType: 'Light balanced tropical blend',
      ratePerThousandSqFt: 3.0,
      minDaysBetween: 60,
      proTip: 'In frost-free zones, light winter feeding maintains year-round color. Reduce rate to avoid excessive growth during slower growth months.',
    },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Looks up the USDA hardiness zone for a given city and state.
 * Falls back to the state representative zone if the city is not in the override table.
 * Returns null if the state code is not recognized.
 */
export function getUsdaZone(city: string, state: string): UsdaZoneInfo | null {
  const stateUpper = state.trim().toUpperCase();
  const stateZone = STATE_ZONES[stateUpper];
  if (!stateZone) return null;

  // Check city-level override (case-insensitive)
  const cityLower = city.trim().toLowerCase();
  const cityOverrides = CITY_ZONE_OVERRIDES[stateUpper];
  const cityZone = cityOverrides?.[cityLower] ?? stateZone;

  const { zone, subzone } = cityZone;
  const meta = ZONE_META[zone] ?? ZONE_META[5]; // fallback to 5

  return {
    zone,
    subzone,
    label: `Zone ${zone}${subzone}`,
    description: meta.description,
    climateCategory: meta.climateCategory,
    typicalFirstFrost: meta.typicalFirstFrost,
    typicalLastFrost: meta.typicalLastFrost,
    minTempRange: meta.minTempRange,
    recommendedGrassType: meta.recommendedGrassType,
  };
}

/**
 * Returns zone-aware NPK fertilizer schedule data for the given climate category and season.
 */
export function getZoneNpkSchedule(climateCategory: ClimateCategory, season: Season): ZoneNpkSchedule {
  return NPK_BY_CLIMATE_SEASON[climateCategory]?.[season] ?? NPK_BY_CLIMATE_SEASON.cool[season];
}

/**
 * Computes a complete fertilizer recommendation including NPK, timing, and amount,
 * based on the user's USDA zone, the current season, their fertilizer history, and lawn size.
 *
 * @param zoneInfo        - Output from getUsdaZone()
 * @param season          - Current meteorological season
 * @param lastAppDate     - ISO date string of last fertilizer application, or undefined
 * @param lawnSizeSqFt    - Lawn size in sq ft, or null if not set
 */
export function getZoneFertilizerRecommendation(
  zoneInfo: UsdaZoneInfo,
  season: Season,
  lastAppDate?: string,
  lawnSizeSqFt?: number | null,
): NpkRecommendation {
  const schedule = getZoneNpkSchedule(zoneInfo.climateCategory, season);

  // Dormant / skip window
  if (schedule.minDaysBetween === null) {
    return {
      npk: schedule.npk,
      productType: schedule.productType,
      ratePerThousandSqFt: schedule.ratePerThousandSqFt,
      suggestedTotalLbs: null,
      proTip: schedule.proTip,
      seasonStatus: 'dormant',
      daysUntilDue: null,
      timingLabel: 'Not recommended this season',
    };
  }

  const suggestedTotalLbs =
    lawnSizeSqFt && lawnSizeSqFt > 0 && schedule.ratePerThousandSqFt > 0
      ? Math.round(((lawnSizeSqFt / 1000) * schedule.ratePerThousandSqFt) * 10) / 10
      : null;

  // No history
  if (!lastAppDate) {
    return {
      npk: schedule.npk,
      productType: schedule.productType,
      ratePerThousandSqFt: schedule.ratePerThousandSqFt,
      suggestedTotalLbs,
      proTip: schedule.proTip,
      seasonStatus: 'active',
      daysUntilDue: 0,
      timingLabel: 'No history — first application recommended',
    };
  }

  // Compute timing
  const lastDate = new Date(lastAppDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilDue = schedule.minDaysBetween - daysSince;

  let timingLabel: string;
  if (daysUntilDue > 0) {
    timingLabel = `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
  } else if (daysUntilDue === 0) {
    timingLabel = 'Due today';
  } else if (daysUntilDue >= -14) {
    timingLabel = `Due now (${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} past window)`;
  } else {
    timingLabel = `Overdue by ${Math.abs(daysUntilDue)} days`;
  }

  return {
    npk: schedule.npk,
    productType: schedule.productType,
    ratePerThousandSqFt: schedule.ratePerThousandSqFt,
    suggestedTotalLbs: daysUntilDue > 0 ? null : suggestedTotalLbs,
    proTip: schedule.proTip,
    seasonStatus: 'active',
    daysUntilDue,
    timingLabel,
  };
}
