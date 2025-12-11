/**
 * Geo utilities for distance calculation
 */

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string (e.g., "1.2 km" or "500 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // Show in meters if less than 1 km
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }

  // Show in kilometers with 1 decimal place
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Sort an array of items by distance from a reference point
 * @param items - Array of items with latitude and longitude
 * @param refLat - Reference latitude
 * @param refLon - Reference longitude
 * @returns Sorted array with distance property added
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
  items: T[],
  refLat: number,
  refLon: number
): (T & { distance: number })[] {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(refLat, refLon, item.latitude, item.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
}