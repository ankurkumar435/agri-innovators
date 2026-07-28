export interface ReverseGeoResult {
  city: string;
  region: string;
  country: string;
}

const cache = new Map<string, ReverseGeoResult>();
const key = (lat: number, lon: number) => `${lat.toFixed(3)},${lon.toFixed(3)}`;

/**
 * Single source of truth for turning coordinates into a place name.
 * OpenStreetMap/Nominatim is used first (it resolves Indian villages/blocks
 * correctly, e.g. "Ghanghata"), with BigDataCloud as a fallback.
 * Every part of the app must use this so the header and the weather card
 * never disagree about the user's location.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeoResult> {
  const k = key(lat, lon);
  const hit = cache.get(k);
  if (hit) return hit;

  // 1) Nominatim (OSM)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=12&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const d = await res.json();
      const a = d.address || {};
      const city =
        a.village || a.town || a.city || a.suburb || a.hamlet ||
        a.municipality || a.county || a.state_district || '';
      const region = a.state || a.region || '';
      const country = a.country || '';
      if (city || region) {
        const result = { city, region, country };
        cache.set(k, result);
        return result;
      }
    }
  } catch {
    /* fall through */
  }

  // 2) BigDataCloud fallback
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const d = await res.json();
    const result = {
      city: d.locality || d.city || '',
      region: d.principalSubdivision || '',
      country: d.countryName || '',
    };
    cache.set(k, result);
    return result;
  } catch {
    return { city: '', region: '', country: '' };
  }
}

export const formatLocation = (r: Partial<ReverseGeoResult>) =>
  [r.city, r.region, r.country].filter(Boolean).join(', ');
