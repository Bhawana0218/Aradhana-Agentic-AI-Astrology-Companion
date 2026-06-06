const CACHE_KEY = 'astroagent-geocode-cache';

const KNOWN_CITIES: Record<string, { lat: number; lon: number; timezone: string }> = {
  'mumbai': { lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata' },
  'delhi': { lat: 28.7041, lon: 77.1025, timezone: 'Asia/Kolkata' },
  'bangalore': { lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  'hyderabad': { lat: 17.3850, lon: 78.4867, timezone: 'Asia/Kolkata' },
  'ahmedabad': { lat: 23.0225, lon: 72.5714, timezone: 'Asia/Kolkata' },
  'chennai': { lat: 13.0827, lon: 80.2707, timezone: 'Asia/Kolkata' },
  'kolkata': { lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata' },
  'pune': { lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata' },
  'jaipur': { lat: 26.9124, lon: 75.7873, timezone: 'Asia/Kolkata' },
  'lucknow': { lat: 26.8467, lon: 80.9462, timezone: 'Asia/Kolkata' },
  'kanpur': { lat: 26.4499, lon: 80.3319, timezone: 'Asia/Kolkata' },
  'nagpur': { lat: 21.1458, lon: 79.0882, timezone: 'Asia/Kolkata' },
  'indore': { lat: 22.7196, lon: 75.8577, timezone: 'Asia/Kolkata' },
  'bhopal': { lat: 23.2599, lon: 77.4126, timezone: 'Asia/Kolkata' },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185, timezone: 'Asia/Kolkata' },
  'surat': { lat: 21.1702, lon: 72.8311, timezone: 'Asia/Kolkata' },
  'vadodara': { lat: 22.3072, lon: 73.1812, timezone: 'Asia/Kolkata' },
  'patna': { lat: 25.5941, lon: 85.1376, timezone: 'Asia/Kolkata' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, timezone: 'Asia/Kolkata' },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366, timezone: 'Asia/Kolkata' },
  'kochi': { lat: 9.9312, lon: 76.2673, timezone: 'Asia/Kolkata' },
  'coimbatore': { lat: 11.0168, lon: 76.9558, timezone: 'Asia/Kolkata' },
  'madurai': { lat: 9.9252, lon: 78.1198, timezone: 'Asia/Kolkata' },
  'guwahati': { lat: 26.1445, lon: 91.7362, timezone: 'Asia/Kolkata' },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245, timezone: 'Asia/Kolkata' },
  'ranchi': { lat: 23.3441, lon: 85.3096, timezone: 'Asia/Kolkata' },
  'jammu': { lat: 32.7266, lon: 74.8570, timezone: 'Asia/Kolkata' },
  'srinagar': { lat: 34.0837, lon: 74.7973, timezone: 'Asia/Kolkata' },
  'amritsar': { lat: 31.6340, lon: 74.8723, timezone: 'Asia/Kolkata' },
  'ludhiana': { lat: 30.9010, lon: 75.8573, timezone: 'Asia/Kolkata' },
  'agra': { lat: 27.1767, lon: 78.0081, timezone: 'Asia/Kolkata' },
  'varanasi': { lat: 25.3176, lon: 82.9739, timezone: 'Asia/Kolkata' },
  'nashik': { lat: 19.9975, lon: 73.7898, timezone: 'Asia/Kolkata' },
  'aurangabad': { lat: 19.8762, lon: 75.3433, timezone: 'Asia/Kolkata' },
  'mangalore': { lat: 12.9141, lon: 74.8560, timezone: 'Asia/Kolkata' },
  'mysore': { lat: 12.2958, lon: 76.6394, timezone: 'Asia/Kolkata' },
  'gurugram': { lat: 28.4595, lon: 77.0266, timezone: 'Asia/Kolkata' },
  'noida': { lat: 28.5355, lon: 77.3910, timezone: 'Asia/Kolkata' },
  'goa': { lat: 15.4909, lon: 73.8278, timezone: 'Asia/Kolkata' },
  'panaji': { lat: 15.4909, lon: 73.8278, timezone: 'Asia/Kolkata' },
  'shimla': { lat: 31.1048, lon: 77.1734, timezone: 'Asia/Kolkata' },
  'darjeeling': { lat: 27.0410, lon: 88.2663, timezone: 'Asia/Kolkata' },
  'pondicherry': { lat: 11.9416, lon: 79.8083, timezone: 'Asia/Kolkata' },
  'ujjain': { lat: 23.1793, lon: 75.7849, timezone: 'Asia/Kolkata' },
  'haridwar': { lat: 29.9457, lon: 78.1642, timezone: 'Asia/Kolkata' },
  'rishikesh': { lat: 30.0869, lon: 78.2676, timezone: 'Asia/Kolkata' },
  'mathura': { lat: 27.4924, lon: 77.6737, timezone: 'Asia/Kolkata' },
  'dwarka': { lat: 22.2442, lon: 68.9685, timezone: 'Asia/Kolkata' },
  'tiruvannamalai': { lat: 12.2253, lon: 79.0747, timezone: 'Asia/Kolkata' },
  'triuvannamalai': { lat: 12.2253, lon: 79.0747, timezone: 'Asia/Kolkata' },
  'tirupati': { lat: 13.6288, lon: 79.4192, timezone: 'Asia/Kolkata' },
  'new york': { lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  'london': { lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  'tokyo': { lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  'sydney': { lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  'dubai': { lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
  'singapore': { lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
};

function getCache(): Record<string, { lat: number; lon: number; timezone: string }> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setCache(place: string, data: { lat: number; lon: number; timezone: string }) {
  try {
    const cache = getCache();
    cache[place.toLowerCase().trim()] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* ignore */ }
}

function normalizePlace(place: string): string {
  return place.toLowerCase().replace(/[,\s]+/g, ' ').trim();
}

async function fetchFromOSM(place: string): Promise<{ lat: number; lon: number; timezone: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`,
      {
        headers: { 'User-Agent': 'AradhanaAstroApp/1.0' },
        signal: controller.signal,
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;

    const { lat, lon } = data[0];
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    return { lat: latNum, lon: lonNum, timezone: guessTimezone(latNum, lonNum) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function guessTimezone(lat: number, lon: number): string {
  if (lat >= 6 && lat <= 37 && lon >= 68 && lon <= 98) return 'Asia/Kolkata';
  return 'UTC';
}

export async function resolvePlace(place: string): Promise<{
  place: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}> {
  const key = normalizePlace(place);

  // 1. Check known cities
  for (const [city, data] of Object.entries(KNOWN_CITIES)) {
    if (key.includes(city)) {
      return { place, lat: data.lat, lon: data.lon, timezone: data.timezone };
    }
  }

  // 2. Check localStorage cache
  const cache = getCache();
  if (cache[key]) {
    return { place, lat: cache[key].lat, lon: cache[key].lon, timezone: cache[key].timezone };
  }

  // 3. Fetch from OSM Nominatim (with timeout)
  const result = await fetchFromOSM(place);
  if (result) {
    setCache(place, result);
    return { place, lat: result.lat, lon: result.lon, timezone: result.timezone };
  }

  // 4. Fallback — use India default
  return { place, lat: 20.5937, lon: 78.9629, timezone: 'Asia/Kolkata' };
}
