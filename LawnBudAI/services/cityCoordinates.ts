/**
 * City Coordinates Lookup Service
 *
 * Provides approximate latitude/longitude for US cities and states.
 * Used to query the Open-Meteo soil temperature API without requiring
 * a live geocoding API call.
 *
 * City coordinates are for major metros corresponding to the city-level
 * overrides in usdaZone.ts. State fallbacks are state geographic centers.
 *
 * Sources:
 *   - US Census Bureau geographic centers (states)
 *   - city-data.com and Wikipedia (city coordinates)
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

// ---------------------------------------------------------------------------
// City-level coordinates (normalized to lowercase, keyed by state → city)
// ---------------------------------------------------------------------------

const CITY_COORDS: Record<string, Record<string, Coordinates>> = {
  AK: {
    anchorage: { lat: 61.22, lon: -149.9 },
    fairbanks: { lat: 64.84, lon: -147.72 },
    juneau: { lat: 58.3, lon: -134.42 },
  },
  AZ: {
    phoenix: { lat: 33.45, lon: -112.07 },
    tucson: { lat: 32.22, lon: -110.97 },
    flagstaff: { lat: 35.2, lon: -111.65 },
    yuma: { lat: 32.69, lon: -114.63 },
  },
  CA: {
    'san diego': { lat: 32.72, lon: -117.16 },
    'los angeles': { lat: 34.05, lon: -118.24 },
    'san francisco': { lat: 37.77, lon: -122.42 },
    sacramento: { lat: 38.58, lon: -121.49 },
    fresno: { lat: 36.74, lon: -119.77 },
    'lake tahoe': { lat: 39.09, lon: -120.03 },
    mammoth: { lat: 37.65, lon: -118.97 },
    eureka: { lat: 40.8, lon: -124.16 },
  },
  CO: {
    denver: { lat: 39.74, lon: -104.98 },
    'colorado springs': { lat: 38.83, lon: -104.82 },
    aspen: { lat: 39.19, lon: -106.82 },
    pueblo: { lat: 38.25, lon: -104.61 },
    'fort collins': { lat: 40.59, lon: -105.08 },
  },
  FL: {
    miami: { lat: 25.77, lon: -80.19 },
    tampa: { lat: 27.95, lon: -82.46 },
    orlando: { lat: 28.54, lon: -81.38 },
    jacksonville: { lat: 30.33, lon: -81.66 },
    pensacola: { lat: 30.42, lon: -87.22 },
    'fort lauderdale': { lat: 26.12, lon: -80.14 },
  },
  GA: {
    atlanta: { lat: 33.75, lon: -84.39 },
    savannah: { lat: 32.08, lon: -81.1 },
    macon: { lat: 32.84, lon: -83.63 },
  },
  HI: {
    honolulu: { lat: 21.31, lon: -157.86 },
    hilo: { lat: 19.73, lon: -155.09 },
    kailua: { lat: 21.4, lon: -157.74 },
  },
  ID: {
    boise: { lat: 43.62, lon: -116.2 },
    "coeur d'alene": { lat: 47.68, lon: -116.78 },
    'sun valley': { lat: 43.7, lon: -114.35 },
  },
  IL: {
    chicago: { lat: 41.85, lon: -87.65 },
    springfield: { lat: 39.8, lon: -89.65 },
    peoria: { lat: 40.69, lon: -89.59 },
  },
  MN: {
    minneapolis: { lat: 44.98, lon: -93.27 },
    'saint paul': { lat: 44.94, lon: -93.1 },
    'st. paul': { lat: 44.94, lon: -93.1 },
    duluth: { lat: 46.79, lon: -92.11 },
    rochester: { lat: 44.02, lon: -92.47 },
  },
  MT: {
    billings: { lat: 45.78, lon: -108.5 },
    missoula: { lat: 46.87, lon: -114.0 },
    helena: { lat: 46.6, lon: -112.02 },
  },
  NC: {
    charlotte: { lat: 35.23, lon: -80.84 },
    raleigh: { lat: 35.77, lon: -78.64 },
    asheville: { lat: 35.57, lon: -82.55 },
    wilmington: { lat: 34.22, lon: -77.95 },
  },
  NY: {
    'new york': { lat: 40.71, lon: -74.01 },
    'new york city': { lat: 40.71, lon: -74.01 },
    nyc: { lat: 40.71, lon: -74.01 },
    buffalo: { lat: 42.89, lon: -78.88 },
    albany: { lat: 42.66, lon: -73.8 },
    syracuse: { lat: 43.05, lon: -76.15 },
  },
  OR: {
    portland: { lat: 45.52, lon: -122.68 },
    bend: { lat: 44.06, lon: -121.31 },
    eugene: { lat: 44.05, lon: -123.09 },
    medford: { lat: 42.33, lon: -122.87 },
  },
  PA: {
    philadelphia: { lat: 39.95, lon: -75.17 },
    pittsburgh: { lat: 40.44, lon: -79.99 },
  },
  TN: {
    nashville: { lat: 36.17, lon: -86.78 },
    memphis: { lat: 35.15, lon: -90.05 },
    knoxville: { lat: 35.97, lon: -83.94 },
    chattanooga: { lat: 35.05, lon: -85.31 },
  },
  TX: {
    dallas: { lat: 32.78, lon: -96.8 },
    houston: { lat: 29.76, lon: -95.37 },
    'san antonio': { lat: 29.42, lon: -98.49 },
    austin: { lat: 30.27, lon: -97.74 },
    'el paso': { lat: 31.79, lon: -106.42 },
    lubbock: { lat: 33.58, lon: -101.86 },
    amarillo: { lat: 35.22, lon: -101.83 },
  },
  VA: {
    richmond: { lat: 37.54, lon: -77.44 },
    norfolk: { lat: 36.85, lon: -76.29 },
    'virginia beach': { lat: 36.85, lon: -75.98 },
    roanoke: { lat: 37.27, lon: -79.94 },
  },
  WA: {
    seattle: { lat: 47.61, lon: -122.33 },
    spokane: { lat: 47.66, lon: -117.43 },
    tacoma: { lat: 47.25, lon: -122.44 },
    olympia: { lat: 47.04, lon: -122.9 },
    yakima: { lat: 46.6, lon: -120.51 },
  },
  WI: {
    madison: { lat: 43.07, lon: -89.4 },
    milwaukee: { lat: 43.04, lon: -87.91 },
    'green bay': { lat: 44.52, lon: -88.02 },
    'eau claire': { lat: 44.81, lon: -91.5 },
    superior: { lat: 46.72, lon: -92.1 },
  },
};

// ---------------------------------------------------------------------------
// State geographic center fallbacks (all 50 states + DC)
// ---------------------------------------------------------------------------

const STATE_COORDS: Record<string, Coordinates> = {
  AK: { lat: 64.2, lon: -153.0 },
  AL: { lat: 32.75, lon: -86.83 },
  AR: { lat: 34.9, lon: -92.37 },
  AZ: { lat: 34.17, lon: -111.93 },
  CA: { lat: 36.78, lon: -119.42 },
  CO: { lat: 39.11, lon: -105.36 },
  CT: { lat: 41.6, lon: -72.69 },
  DC: { lat: 38.91, lon: -77.02 },
  DE: { lat: 38.91, lon: -75.53 },
  FL: { lat: 27.99, lon: -81.76 },
  GA: { lat: 32.68, lon: -83.22 },
  HI: { lat: 20.8, lon: -156.33 },
  IA: { lat: 42.0, lon: -93.5 },
  ID: { lat: 44.07, lon: -114.74 },
  IL: { lat: 40.0, lon: -89.0 },
  IN: { lat: 39.77, lon: -86.15 },
  KS: { lat: 38.5, lon: -98.5 },
  KY: { lat: 37.67, lon: -84.27 },
  LA: { lat: 31.17, lon: -91.87 },
  MA: { lat: 42.23, lon: -71.53 },
  MD: { lat: 39.05, lon: -76.64 },
  ME: { lat: 45.37, lon: -69.23 },
  MI: { lat: 44.18, lon: -84.51 },
  MN: { lat: 46.39, lon: -94.64 },
  MO: { lat: 38.46, lon: -92.29 },
  MS: { lat: 32.74, lon: -89.67 },
  MT: { lat: 46.88, lon: -110.36 },
  NC: { lat: 35.63, lon: -79.8 },
  ND: { lat: 47.65, lon: -100.44 },
  NE: { lat: 41.5, lon: -99.9 },
  NH: { lat: 43.45, lon: -71.57 },
  NJ: { lat: 39.83, lon: -74.87 },
  NM: { lat: 34.31, lon: -106.02 },
  NV: { lat: 38.5, lon: -117.0 },
  NY: { lat: 42.94, lon: -75.52 },
  OH: { lat: 40.37, lon: -82.8 },
  OK: { lat: 35.57, lon: -96.93 },
  OR: { lat: 43.94, lon: -120.55 },
  PA: { lat: 40.27, lon: -76.88 },
  RI: { lat: 41.68, lon: -71.56 },
  SC: { lat: 33.84, lon: -80.45 },
  SD: { lat: 44.37, lon: -100.34 },
  TN: { lat: 35.86, lon: -86.35 },
  TX: { lat: 31.47, lon: -99.33 },
  UT: { lat: 39.42, lon: -111.09 },
  VA: { lat: 37.77, lon: -78.17 },
  VT: { lat: 44.06, lon: -72.67 },
  WA: { lat: 47.38, lon: -120.45 },
  WI: { lat: 44.27, lon: -89.62 },
  WV: { lat: 38.47, lon: -80.95 },
  WY: { lat: 43.08, lon: -107.29 },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the best-available lat/lon for the given city and state.
 * Checks city-level overrides first; falls back to state geographic center.
 *
 * @param city  - City name (case-insensitive)
 * @param state - Two-letter state code (uppercase)
 */
export function getCityCoordinates(city: string, state: string): Coordinates | null {
  const stateKey = state.toUpperCase();
  const cityKey = city.toLowerCase().trim();

  // Check city-level override
  const cityCoords = CITY_COORDS[stateKey]?.[cityKey];
  if (cityCoords) return cityCoords;

  // Fall back to state center
  const stateCoords = STATE_COORDS[stateKey];
  if (stateCoords) return stateCoords;

  return null;
}
