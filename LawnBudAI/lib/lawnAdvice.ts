/**
 * Lawn Care Advice Engine
 *
 * Seasonal and regional mowing, watering, and fertilizer advice derived from
 * university cooperative extension programs:
 *
 *  - UW-Madison Division of Extension (cool-season, Midwest):
 *      https://extension.wisc.edu/
 *  - Penn State Extension (cool-season, Northeast):
 *      https://extension.psu.edu/
 *  - Texas A&M AgriLife Extension (warm-season, South):
 *      https://aggie-horticulture.tamu.edu/
 *  - University of Florida IFAS Extension (warm-season, Southeast):
 *      https://gardeningsolutions.ifas.ufl.edu/
 *  - Clemson Cooperative Extension (transition zone):
 *      https://hgic.clemson.edu/
 *  - NC State Extension (transition zone):
 *      https://turf.ces.ncsu.edu/
 */

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type GrassType = 'cool_season' | 'warm_season' | 'mixed';

export interface LawnAdvice {
  name: string;
  text: string;
}

/**
 * Derives the meteorological season from a given date.
 * Spring: Mar–May | Summer: Jun–Aug | Fall: Sep–Nov | Winter: Dec–Feb
 */
export function getSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // 1-based
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

// ---------------------------------------------------------------------------
// Mowing advice
// Source: UW-Madison Extension (cool), Texas A&M AgriLife (warm)
// ---------------------------------------------------------------------------

const mowingAdvice: Record<GrassType, Record<Season, LawnAdvice>> = {
  cool_season: {
    spring: {
      name: 'Mowing',
      text: 'Primary growing season. Mow at 2.5–3.5" weekly as growth picks up. Avoid cutting more than 1/3 of the blade at once.',
    },
    summer: {
      name: 'Mowing',
      text: 'Growth slows in summer heat. Raise cutting height to 3.5–4" to protect roots and reduce stress. Mow less frequently.',
    },
    fall: {
      name: 'Mowing',
      text: 'Second growth flush — great time for overseeding. Keep mowing at 2.5–3.5" until grass stops growing.',
    },
    winter: {
      name: 'Mowing',
      text: 'Grass is dormant or very slow. Mow only if actively growing and over 4". Avoid mowing frozen or frost-covered grass.',
    },
  },
  warm_season: {
    spring: {
      name: 'Mowing',
      text: 'Grass is breaking dormancy. Once green, scalp once to remove dead material, then maintain at 1.5–2". Begin regular mowing.',
    },
    summer: {
      name: 'Mowing',
      text: 'Peak growing season. Mow at 1–2.5" (Bermuda/Zoysia lower; St. Augustine higher). May need to mow 1–2× per week.',
    },
    fall: {
      name: 'Mowing',
      text: 'Growth is slowing. Gradually reduce frequency. Complete final mow before dormancy to avoid matting. Avoid scalping.',
    },
    winter: {
      name: 'Mowing',
      text: 'Grass is dormant — no mowing needed. If overseeded with ryegrass, mow at 1.5–2" as needed.',
    },
  },
  mixed: {
    spring: {
      name: 'Mowing',
      text: 'Mow at 2–3" as growth resumes. Mixed lawns vary in timing — let growth guide frequency rather than the calendar.',
    },
    summer: {
      name: 'Mowing',
      text: 'Keep height at 3–3.5" to protect cool-season areas from heat stress. Warm-season areas may need more frequent mowing.',
    },
    fall: {
      name: 'Mowing',
      text: 'Good time to overseed thin cool-season areas. Mow at 2.5–3" to support both grass types heading into winter.',
    },
    winter: {
      name: 'Mowing',
      text: 'Warm-season areas are dormant. Mow cool-season areas only if actively growing. Keep blades sharp for clean winter cuts.',
    },
  },
};

// ---------------------------------------------------------------------------
// Watering advice
// Source: UW-Madison Extension, UF/IFAS
// ---------------------------------------------------------------------------

const wateringAdvice: Record<GrassType, Record<Season, LawnAdvice>> = {
  cool_season: {
    spring: {
      name: 'Watering',
      text: 'Spring rains often provide enough moisture. Supplement only if soil is dry 2" below the surface. Target 1" per week total.',
    },
    summer: {
      name: 'Watering',
      text: 'Heat increases demand. Water deeply (1–1.5") once or twice a week in early morning. Some dormancy is normal and recoverable.',
    },
    fall: {
      name: 'Watering',
      text: 'Cooler temps reduce evaporation. Maintain 1" per week until the ground freezes. Deep watering supports root development.',
    },
    winter: {
      name: 'Watering',
      text: 'No supplemental irrigation needed during dormancy. Resume watering when daytime temps consistently reach 40°F+.',
    },
  },
  warm_season: {
    spring: {
      name: 'Watering',
      text: 'Increase watering as dormancy ends. Target 0.5–1" per week to encourage even green-up. Avoid overwatering dormant areas.',
    },
    summer: {
      name: 'Watering',
      text: 'Peak demand season. Apply 1–1.5" per week in the early morning. Watch for footprinting or blue-gray color as stress signs.',
    },
    fall: {
      name: 'Watering',
      text: 'Gradually reduce as temps drop. Target 0.5–1" per week. Stop irrigation 2–4 weeks before first expected frost.',
    },
    winter: {
      name: 'Watering',
      text: 'Dormant grass needs minimal water. Water only if soil is very dry during an extended warm, dry spell.',
    },
  },
  mixed: {
    spring: {
      name: 'Watering',
      text: 'Water to support both grass types. Target 1" per week as temperatures rise and growth picks up.',
    },
    summer: {
      name: 'Watering',
      text: 'Cool-season areas may show stress in heat — keep watering consistently. Target 1–1.5"/week in early morning.',
    },
    fall: {
      name: 'Watering',
      text: 'Fall is critical for cool-season recovery. Continue 1"/week until soil freezes to support root growth.',
    },
    winter: {
      name: 'Watering',
      text: 'Reduce or stop irrigation. Cool-season areas may still benefit from occasional deep watering during warm, dry spells.',
    },
  },
};

// ---------------------------------------------------------------------------
// Fertilizer advice
// Source: Penn State Extension, Texas A&M AgriLife, Clemson Extension
// ---------------------------------------------------------------------------

const fertilizerAdvice: Record<GrassType, Record<Season, LawnAdvice>> = {
  cool_season: {
    spring: {
      name: 'Fertilizing',
      text: 'Light fertilization only (0.5–1 lb N/1000 sq ft). Heavy spring feeding promotes excessive top growth. Soil test first if possible.',
    },
    summer: {
      name: 'Fertilizing',
      text: 'Avoid fertilizing during summer stress. Feeding now stimulates growth that increases heat and drought vulnerability.',
    },
    fall: {
      name: 'Fertilizing',
      text: 'Prime fertilization window (Sep–Nov). Apply 1–1.5 lb N/1000 sq ft to build carbohydrate reserves and strengthen roots for winter.',
    },
    winter: {
      name: 'Fertilizing',
      text: 'Do not fertilize during dormancy. The last fall application carries the lawn through winter.',
    },
  },
  warm_season: {
    spring: {
      name: 'Fertilizing',
      text: 'Wait until grass is fully green and growing (late spring). Apply balanced fertilizer (1 lb N/1000 sq ft). Pre-emergent weed control first.',
    },
    summer: {
      name: 'Fertilizing',
      text: 'Active growing season — fertilize every 6–8 weeks. Apply up to 1 lb N/1000 sq ft per application. Avoid fertilizing drought-stressed grass.',
    },
    fall: {
      name: 'Fertilizing',
      text: 'Final application in early fall (8+ weeks before frost). Use a low-nitrogen, high-potassium blend to harden grass for dormancy.',
    },
    winter: {
      name: 'Fertilizing',
      text: 'No fertilizer during dormancy. Excess nitrogen on dormant grass can promote winter weeds and disease.',
    },
  },
  mixed: {
    spring: {
      name: 'Fertilizing',
      text: 'Light nitrogen application once warm-season areas green up. Avoid heavy feeding of cool-season areas — they are entering a stress period.',
    },
    summer: {
      name: 'Fertilizing',
      text: 'Fertilize warm-season areas (1 lb N/1000 sq ft). Hold off on cool-season areas until temperatures drop in late summer.',
    },
    fall: {
      name: 'Fertilizing',
      text: 'Best time to feed cool-season grasses. Transition zone fall fertilization supports root development for both grass types.',
    },
    winter: {
      name: 'Fertilizing',
      text: 'Hold off on fertilization. Both cool and warm season grasses benefit from a winter rest period without nitrogen inputs.',
    },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getMowingAdvice(grassType: GrassType, season: Season): LawnAdvice {
  return mowingAdvice[grassType]?.[season] ?? mowingAdvice.mixed[season];
}

export function getWateringAdvice(grassType: GrassType, season: Season): LawnAdvice {
  return wateringAdvice[grassType]?.[season] ?? wateringAdvice.mixed[season];
}

export function getFertilizerAdvice(grassType: GrassType, season: Season): LawnAdvice {
  return fertilizerAdvice[grassType]?.[season] ?? fertilizerAdvice.mixed[season];
}
