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
// Overseeding reminders
//
// Uses month-level windows rather than broad seasons because the overseeding
// opportunity is narrow (~6–10 weeks). Windows are based on soil-temperature
// research from:
//   - University of Minnesota Extension (cool-season):
//       https://extension.umn.edu/lawn-care/overseeding-lawns
//   - Penn State Turfgrass Science (cool-season timing):
//       https://plantscience.psu.edu/research/centers/turf
//   - Clemson Extension (warm-season ryegrass overseeding):
//       https://hgic.clemson.edu/factsheet/lawn-overseeding/
//   - Texas A&M AgriLife (warm-season ryegrass overseeding):
//       https://aggie-horticulture.tamu.edu/
// ---------------------------------------------------------------------------

export type OverseedingUrgency = 'now' | 'soon';

export interface OverseedingReminder {
  title: string;
  subtitle: string;
  urgency: OverseedingUrgency;
}

interface OverseedingWindow {
  /** Months (1-based) when overseeding should happen right now. */
  nowMonths: number[];
  /** Months when overseeding is 4–6 weeks out — give a heads-up. */
  soonMonths: number[];
  nowText: string;
  soonText: string;
}

const overseedingWindows: Record<GrassType, OverseedingWindow> = {
  // Cool-season grasses (Kentucky bluegrass, tall fescue, perennial ryegrass)
  // Ideal soil temp for germination: 50–65 °F → typically Aug–Oct in northern US
  cool_season: {
    nowMonths: [8, 9, 10],
    soonMonths: [7],
    nowText:
      'Prime overseeding window is open. Soil temps are ideal (50–65°F) for cool-season germination. ' +
      'Mow existing grass to 2", dethatch or rake thin areas to expose soil, broadcast seed at the ' +
      'recommended rate, then keep the seedbed moist (light watering 2–3× daily) for 2–3 weeks. ' +
      'Avoid heavy foot traffic until the new grass reaches mowing height.',
    soonText:
      'Overseeding season is 4–6 weeks away (mid-August through October). Now is the time to prepare: ' +
      'soil-test your lawn (target pH 6.0–7.0), identify thin or bare areas, and select seed that ' +
      'matches your existing grass. Purchasing seed early ensures the best variety selection.',
  },

  // Warm-season grasses (Bermuda, Zoysia, St. Augustine, Centipede)
  // Overseeding is done with annual or perennial ryegrass for winter color,
  // when daytime highs consistently drop below ~70 °F → typically Oct–Nov
  warm_season: {
    nowMonths: [10, 11],
    soonMonths: [9],
    nowText:
      'Time to overseed with perennial or annual ryegrass for winter color. Scalp existing grass to 1", ' +
      'then broadcast ryegrass at 10–15 lbs/1000 sq ft. Keep soil moist until ryegrass is established. ' +
      'The ryegrass will naturally die off in late spring as your warm-season turf resumes growth — ' +
      'withhold water and fertilizer from the ryegrass to ease that transition.',
    soonText:
      'Winter ryegrass overseeding opens in October once daytime highs drop below 70°F. Start preparing ' +
      'now: scalp your lawn and collect the clippings, and source perennial or annual ryegrass seed. ' +
      'Overseeding too early (while it is still hot) leads to poor germination and summer-weed competition.',
  },

  // Transition-zone / mixed lawns — advice covers both cool and warm areas
  mixed: {
    nowMonths: [8, 9, 10],
    soonMonths: [7],
    nowText:
      'Now is the right time to overseed thin cool-season areas while soil temperatures are in the ' +
      'ideal 50–65°F range. Later in October, consider ryegrass overseeding for any warm-season patches ' +
      'if you want to maintain winter color throughout the lawn. Keep newly seeded areas consistently ' +
      'moist and off-limits to heavy traffic until established.',
    soonText:
      'Overseeding season for cool-season areas of your lawn is 4–6 weeks away (mid-August through October). ' +
      'Soil-test now, choose seed that matches your cool-season grass, and mark thin spots. ' +
      'Warm-season areas of your lawn can be overseeded with ryegrass in October for winter green.',
  },
};

/**
 * Returns an overseeding reminder when the current month falls inside the
 * defined "now" or "soon" window for the given grass type, or null otherwise.
 */
export function getOverseedingReminder(
  grassType: GrassType,
  date: Date = new Date(),
): OverseedingReminder | null {
  const month = date.getMonth() + 1; // 1-based
  const window = overseedingWindows[grassType] ?? overseedingWindows.mixed;

  if (window.nowMonths.includes(month)) {
    return { title: 'Overseed Now', subtitle: window.nowText, urgency: 'now' };
  }
  if (window.soonMonths.includes(month)) {
    return { title: 'Overseeding Season Approaching', subtitle: window.soonText, urgency: 'soon' };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Fertilizer schedule advisor
//
// Combines last-application date, grass type, and season to produce a
// concrete "should I fertilize?" recommendation with a dose calculation
// based on lawn size.
//
// Application rates (lbs N per 1000 sq ft) and interval guidance from:
//   - Penn State Extension "Fertilizing Home Lawns":
//       https://extension.psu.edu/fertilizing-home-lawns
//   - UW-Madison Extension "Lawn Fertilization":
//       https://extension.wisc.edu/
//   - Texas A&M AgriLife "Lawn Fertilization Guide":
//       https://aggie-horticulture.tamu.edu/
//   - UF/IFAS Extension "Florida Lawn Handbook":
//       https://gardeningsolutions.ifas.ufl.edu/
// ---------------------------------------------------------------------------

export type FertilizerStatus =
  | 'dormant'            // Season not appropriate for fertilizing
  | 'first_application'  // No history — time to get started
  | 'due'                // Within the target window
  | 'overdue'            // Past the window by more than 2 weeks
  | 'too_soon';          // Last application was too recent

export interface FertilizerAdvisory {
  status: FertilizerStatus;
  heading: string;
  detail: string;
  /** Suggested pounds of product to apply; null when dormant or lawn size unknown. */
  suggestedAmountLbs: number | null;
  /**
   * Positive → days remaining until due.
   * Zero     → due now.
   * Negative → days overdue.
   * null     → dormant (not applicable).
   */
  daysUntilDue: number | null;
  /** Fertilizer type best suited for the current season. */
  typeRecommendation: string;
}

interface FertilizerSchedule {
  /** null = dormant; no applications in this season. */
  minDaysBetween: number | null;
  /** lbs of fertilizer product per 1000 sq ft. */
  ratePerThousandSqFt: number | null;
  typeRecommendation: string;
}

// Rates reflect actual product weight (not pure-N), assuming a common
// slow-release blend (e.g. 32-0-8 for cool-season, balanced for warm-season).
// Practitioners should always follow the bag directions for their specific product.
const fertilizerSchedule: Record<GrassType, Record<Season, FertilizerSchedule>> = {
  cool_season: {
    spring: {
      minDaysBetween: 45,
      ratePerThousandSqFt: 3.5, // ~0.5 lb N/1000 from a 15-0-8
      typeRecommendation: 'Balanced slow-release (e.g., 15-0-8 or 10-10-10)',
    },
    summer: {
      minDaysBetween: null, // dormant window — skip
      ratePerThousandSqFt: null,
      typeRecommendation: 'None — skip summer fertilization to avoid heat stress',
    },
    fall: {
      minDaysBetween: 30,
      ratePerThousandSqFt: 4.5, // ~1.0–1.5 lb N/1000 from a 32-0-8
      typeRecommendation: 'High-nitrogen slow-release (e.g., 32-0-8 or similar winterizer)',
    },
    winter: {
      minDaysBetween: null,
      ratePerThousandSqFt: null,
      typeRecommendation: 'None — grass is dormant',
    },
  },
  warm_season: {
    spring: {
      minDaysBetween: 45,
      ratePerThousandSqFt: 4.0, // ~1.0 lb N/1000 from a 25-0-12
      typeRecommendation: 'Balanced NPK with micronutrients and iron (e.g., 25-0-12)',
    },
    summer: {
      minDaysBetween: 42,
      ratePerThousandSqFt: 4.0,
      typeRecommendation: 'Nitrogen-rich, low-phosphorus (e.g., 30-0-10)',
    },
    fall: {
      // One application in early fall, 8+ weeks before frost; high interval
      // prevents over-application late in the season.
      minDaysBetween: 60,
      ratePerThousandSqFt: 3.0, // ~0.5 lb N/1000 from a 15-0-15
      typeRecommendation: 'Low-N, high-K winterizer blend (e.g., 5-0-20 or 15-0-15)',
    },
    winter: {
      minDaysBetween: null,
      ratePerThousandSqFt: null,
      typeRecommendation: 'None — grass is dormant',
    },
  },
  mixed: {
    spring: {
      minDaysBetween: 45,
      ratePerThousandSqFt: 3.5,
      typeRecommendation: 'Balanced slow-release NPK (e.g., 16-4-8)',
    },
    summer: {
      minDaysBetween: null,
      ratePerThousandSqFt: null,
      typeRecommendation: 'None — hold off for cool-season areas; warm-season areas may get one application',
    },
    fall: {
      minDaysBetween: 30,
      ratePerThousandSqFt: 4.5,
      typeRecommendation: 'High-nitrogen slow-release for cool-season areas; low-N, high-K for warm-season patches',
    },
    winter: {
      minDaysBetween: null,
      ratePerThousandSqFt: null,
      typeRecommendation: 'None — both grass types are resting',
    },
  },
};

/**
 * Computes a full fertilizer advisory from the user's grass type, the current
 * season, the date of their most recent application, and their lawn size.
 *
 * @param grassType       - User's grass type preference.
 * @param season          - Current season (use getSeason()).
 * @param lastAppDate     - ISO date string (YYYY-MM-DD) of the last application, or undefined if none.
 * @param lawnSizeSqFt    - User's lawn size in square feet, or undefined/null if not set.
 */
export function getFertilizerAdvisory(
  grassType: GrassType,
  season: Season,
  lastAppDate?: string,
  lawnSizeSqFt?: number | null,
): FertilizerAdvisory {
  const schedule = fertilizerSchedule[grassType]?.[season] ?? fertilizerSchedule.mixed[season];

  // ----- Dormant window -----
  if (schedule.minDaysBetween === null) {
    return {
      status: 'dormant',
      heading: 'No Fertilizer Needed',
      detail:
        `${schedule.typeRecommendation}. Fertilizing now risks stimulating growth at the wrong time, ` +
        'increasing disease pressure and wasting product. Wait for the next active season.',
      suggestedAmountLbs: null,
      daysUntilDue: null,
      typeRecommendation: schedule.typeRecommendation,
    };
  }

  // Compute suggested amount if lawn size is known
  const suggestedAmountLbs =
    lawnSizeSqFt && lawnSizeSqFt > 0 && schedule.ratePerThousandSqFt
      ? Math.round(((lawnSizeSqFt / 1000) * schedule.ratePerThousandSqFt) * 10) / 10
      : null;

  const amountNote =
    suggestedAmountLbs !== null
      ? ` For your ${lawnSizeSqFt!.toLocaleString()} sq ft lawn, that is about ${suggestedAmountLbs} lbs of product.`
      : ' Set your lawn size in Settings to get a precise amount recommendation.';

  // ----- No application history -----
  if (!lastAppDate) {
    return {
      status: 'first_application',
      heading: 'Schedule Your First Application',
      detail:
        `No fertilizer history found. ${schedule.typeRecommendation} is ideal for this season.` +
        amountNote,
      suggestedAmountLbs,
      daysUntilDue: 0,
      typeRecommendation: schedule.typeRecommendation,
    };
  }

  // ----- Compute days since last application -----
  const lastDate = new Date(lastAppDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilDue = schedule.minDaysBetween - daysSince;

  // ----- Too soon -----
  if (daysUntilDue > 0) {
    return {
      status: 'too_soon',
      heading: 'Too Soon to Fertilize',
      detail:
        `Your last application was ${daysSince} day${daysSince !== 1 ? 's' : ''} ago. ` +
        `Wait ${daysUntilDue} more day${daysUntilDue !== 1 ? 's' : ''} before the next application ` +
        `to avoid burning the lawn and wasting product.`,
      suggestedAmountLbs: null,
      daysUntilDue,
      typeRecommendation: schedule.typeRecommendation,
    };
  }

  // ----- Overdue (more than 2 weeks past the window) -----
  if (daysUntilDue < -14) {
    return {
      status: 'overdue',
      heading: 'Fertilization Overdue',
      detail:
        `It has been ${daysSince} days since your last application — about ` +
        `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} past the target window. ` +
        `Apply ${schedule.typeRecommendation} soon.${amountNote}`,
      suggestedAmountLbs,
      daysUntilDue,
      typeRecommendation: schedule.typeRecommendation,
    };
  }

  // ----- Due (within window) -----
  return {
    status: 'due',
    heading: 'Time to Fertilize',
    detail:
      `Your last application was ${daysSince} day${daysSince !== 1 ? 's' : ''} ago — right on schedule. ` +
      `Apply ${schedule.typeRecommendation}.${amountNote}`,
    suggestedAmountLbs,
    daysUntilDue: 0,
    typeRecommendation: schedule.typeRecommendation,
  };
}

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
