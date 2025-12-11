/**
 * Google Places API Service
 * 
 * Provides functionality to fetch nearby hospitals and healthcare facilities
 * using the Google Places Nearby Search API.
 */

import { GOOGLE_PLACES_API_KEY } from '@env';
import { Hospital, HospitalType } from '../types/hospital';
import { Id } from '../../convex/_generated/dataModel';

// Google Places API endpoint
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

// Default search radius in meters (5km)
const DEFAULT_RADIUS = 5000;

// Place types to search for healthcare facilities
const HEALTHCARE_TYPES = ['hospital', 'health', 'doctor', 'clinic'];

/**
 * Google Places API response types
 */
interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  opening_hours?: {
    open_now?: boolean;
  };
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  plus_code?: {
    compound_code?: string;
  };
}

interface GooglePlacesResponse {
  status: string;
  results: GooglePlaceResult[];
  error_message?: string;
  next_page_token?: string;
}

/**
 * Determine hospital type based on Google Places types
 */
function determineHospitalType(types: string[]): HospitalType {
  if (types.includes('hospital')) {
    return 'government'; // Default to government, could be enhanced with additional data
  }
  if (types.includes('doctor') || types.includes('dentist') || types.includes('physiotherapist')) {
    return 'specialist';
  }
  if (types.includes('health') || types.includes('pharmacy')) {
    return 'clinic';
  }
  return 'clinic'; // Default fallback
}

/**
 * Check if the place might have emergency services
 * Based on place types and opening hours
 */
function hasEmergencyServices(place: GooglePlaceResult): boolean {
  // Hospitals typically have emergency services
  if (place.types.includes('hospital')) {
    return true;
  }
  // 24-hour facilities might have emergency services
  if (place.opening_hours?.open_now === true && place.types.includes('health')) {
    return true;
  }
  return false;
}

/**
 * Parse address components from vicinity
 */
function parseAddress(vicinity: string): { address: string; city: string; state: string; postalCode: string } {
  // Google Places vicinity format varies, do basic parsing
  const parts = vicinity.split(',').map(p => p.trim());
  
  return {
    address: parts[0] || vicinity,
    city: parts[1] || 'Unknown',
    state: parts[2] || 'Malaysia',
    postalCode: '', // Not available from Places API basic response
  };
}

/**
 * Convert Google Places result to Hospital type
 * Creates a pseudo-ID since Google Places results don't have Convex IDs
 */
function convertToHospital(place: GooglePlaceResult): Hospital {
  const addressInfo = parseAddress(place.vicinity);
  const hospitalType = determineHospitalType(place.types);
  const now = Date.now();

  return {
    // Create a pseudo ID that mimics the Convex ID format
    // This is safe because we're using it for display purposes only
    _id: `google_${place.place_id}` as unknown as Id<"hospitals">,
    _creationTime: now,
    name: place.name,
    type: hospitalType,
    address: addressInfo.address,
    city: addressInfo.city,
    state: addressInfo.state,
    postalCode: addressInfo.postalCode,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    phoneNumber: undefined, // Not available from basic Places API
    emergencyNumber: undefined,
    website: undefined,
    email: undefined,
    operatingHours: place.opening_hours?.open_now ? 'Open Now' : undefined,
    is24Hours: place.opening_hours?.open_now === true && place.types.includes('hospital'),
    hasEmergency: hasEmergencyServices(place),
    specialties: place.types
      .filter(t => !['point_of_interest', 'establishment', 'health'].includes(t))
      .map(t => t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')),
    facilities: [],
    rating: place.rating,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Build Google Places API URL with query parameters
 * Uses string concatenation to avoid URL class adding trailing slash before query params
 */
function buildPlacesApiUrl(params: Record<string, string>): string {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `${GOOGLE_PLACES_BASE_URL}?${queryString}`;
}

/**
 * Fetch nearby hospitals from Google Places API
 *
 * @param latitude - User's current latitude
 * @param longitude - User's current longitude
 * @param radius - Search radius in meters (default: 5000m / 5km)
 * @returns Promise<Hospital[]> - Array of hospitals converted to Hospital type
 */
export async function fetchNearbyHospitals(
  latitude: number,
  longitude: number,
  radius: number = DEFAULT_RADIUS
): Promise<Hospital[]> {
  console.log(`[HospitalFinder] Starting Google Places API search`);
  console.log(`[HospitalFinder] Location: lat=${latitude}, lng=${longitude}, radius=${radius}m`);
  console.log(`[HospitalFinder] API Key configured: ${GOOGLE_PLACES_API_KEY ? 'Yes (length: ' + GOOGLE_PLACES_API_KEY.length + ')' : 'No'}`);

  const allHospitals: Hospital[] = [];
  const seenPlaceIds = new Set<string>();

  // Search for each healthcare type
  for (const type of HEALTHCARE_TYPES) {
    try {
      console.log(`[HospitalFinder] Searching for type: ${type}`);

      // Build URL using string concatenation to avoid trailing slash issue
      const url = buildPlacesApiUrl({
        location: `${latitude},${longitude}`,
        radius: radius.toString(),
        type: type,
        key: GOOGLE_PLACES_API_KEY,
      });

      console.log(`[HospitalFinder] API Request URL: ${url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN')}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`[HospitalFinder] API HTTP Error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data: GooglePlacesResponse = await response.json();
      
      console.log(`[HospitalFinder] API Response status: ${data.status}`);
      console.log(`[HospitalFinder] Results count for ${type}: ${data.results?.length || 0}`);

      if (data.status === 'OK' && data.results) {
        for (const place of data.results) {
          // Avoid duplicates across different type searches
          if (!seenPlaceIds.has(place.place_id)) {
            seenPlaceIds.add(place.place_id);
            
            // Only include active businesses
            if (place.business_status !== 'CLOSED_PERMANENTLY') {
              const hospital = convertToHospital(place);
              allHospitals.push(hospital);
              console.log(`[HospitalFinder] Added: ${hospital.name} (${hospital.type})`);
            }
          }
        }
      } else if (data.status === 'ZERO_RESULTS') {
        console.log(`[HospitalFinder] No results for type: ${type}`);
      } else if (data.error_message) {
        console.error(`[HospitalFinder] API Error: ${data.error_message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[HospitalFinder] Fetch error for type ${type}: ${errorMessage}`);
    }
  }

  console.log(`[HospitalFinder] Total unique hospitals found: ${allHospitals.length}`);
  return allHospitals;
}

/**
 * Search nearby hospitals with a specific keyword
 * 
 * @param latitude - User's current latitude
 * @param longitude - User's current longitude
 * @param keyword - Search keyword (e.g., "emergency", "clinic")
 * @param radius - Search radius in meters
 * @returns Promise<Hospital[]> - Array of hospitals
 */
export async function searchNearbyHospitals(
  latitude: number,
  longitude: number,
  keyword: string,
  radius: number = DEFAULT_RADIUS
): Promise<Hospital[]> {
  console.log(`[HospitalFinder] Searching with keyword: ${keyword}`);

  try {
    // Build URL using string concatenation to avoid trailing slash issue
    const url = buildPlacesApiUrl({
      location: `${latitude},${longitude}`,
      radius: radius.toString(),
      keyword: keyword,
      type: 'hospital|health|doctor|clinic',
      key: GOOGLE_PLACES_API_KEY,
    });

    console.log(`[HospitalFinder] Keyword search URL: ${url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN')}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[HospitalFinder] Keyword search HTTP Error: ${response.status}`);
      return [];
    }

    const data: GooglePlacesResponse = await response.json();
    
    console.log(`[HospitalFinder] Keyword search status: ${data.status}`);
    console.log(`[HospitalFinder] Keyword search results: ${data.results?.length || 0}`);

    if (data.status === 'OK' && data.results) {
      return data.results
        .filter(place => place.business_status !== 'CLOSED_PERMANENTLY')
        .map(convertToHospital);
    }

    if (data.error_message) {
      console.error(`[HospitalFinder] Keyword search error: ${data.error_message}`);
    }

    return [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[HospitalFinder] Keyword search failed: ${errorMessage}`);
    return [];
  }
}

/**
 * Check if the Google Places API key is configured
 */
export function isGooglePlacesConfigured(): boolean {
  const configured = !!GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY.length > 0;
  console.log(`[HospitalFinder] Google Places API configured: ${configured}`);
  return configured;
}

/**
 * Get the default search radius
 */
export function getDefaultSearchRadius(): number {
  return DEFAULT_RADIUS;
}