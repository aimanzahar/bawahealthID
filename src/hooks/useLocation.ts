import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

// Default fallback location (Kuala Lumpur city center)
const DEFAULT_LOCATION = {
  latitude: 3.139003,
  longitude: 101.686855,
};

// Timeout duration for location requests (10 seconds)
const LOCATION_TIMEOUT_MS = 10000;

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param ms Timeout in milliseconds
 * @returns Promise that rejects if timeout is exceeded
 */
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Location timeout')), ms)
    ),
  ]);
};

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface UseLocationReturn {
  location: LocationData | null;
  errorMsg: string | null;
  loading: boolean;
  permissionStatus: Location.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

/**
 * Custom hook for managing GPS location
 * Handles permission requests, location fetching, and error states
 */
export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  /**
   * Fetch location with fallback strategy:
   * 1. Try getLastKnownPositionAsync (cached, instant)
   * 2. Try getCurrentPositionAsync with timeout
   * 3. Fall back to default Kuala Lumpur coordinates
   * @returns LocationData
   */
  const fetchLocationWithFallback = async (): Promise<LocationData> => {
    // Step 1: Try cached location first (instant)
    console.log('[HospitalFinder] Trying getLastKnownPositionAsync for cached location...');
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        const locationData: LocationData = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy,
          timestamp: lastKnown.timestamp,
        };
        console.log(`[HospitalFinder] Cached location found: lat=${locationData.latitude.toFixed(6)}, lng=${locationData.longitude.toFixed(6)}`);
        return locationData;
      }
      console.log('[HospitalFinder] No cached location available');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log(`[HospitalFinder] getLastKnownPositionAsync failed: ${message}`);
    }

    // Step 2: Try getCurrentPositionAsync with timeout
    console.log(`[HospitalFinder] Trying getCurrentPositionAsync with ${LOCATION_TIMEOUT_MS / 1000}s timeout...`);
    try {
      const currentLocation = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        LOCATION_TIMEOUT_MS
      );

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      };
      console.log(`[HospitalFinder] GPS location acquired: lat=${locationData.latitude.toFixed(6)}, lng=${locationData.longitude.toFixed(6)}`);
      console.log(`[HospitalFinder] GPS accuracy: ${locationData.accuracy?.toFixed(2) ?? 'unknown'}m`);
      return locationData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log(`[HospitalFinder] getCurrentPositionAsync failed: ${message}`);
    }

    // Step 3: Fall back to default location
    console.log('[HospitalFinder] Location timeout or error, using default Kuala Lumpur coordinates');
    const defaultLocationData: LocationData = {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      accuracy: null,
      timestamp: Date.now(),
    };
    console.log(`[HospitalFinder] Default location: lat=${defaultLocationData.latitude.toFixed(6)}, lng=${defaultLocationData.longitude.toFixed(6)}`);
    return defaultLocationData;
  };

  /**
   * Request location permissions from the user
   * @returns true if permission was granted, false otherwise
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[HospitalFinder] Requesting location permission...');
    try {
      setLoading(true);
      setErrorMsg(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      console.log(`[HospitalFinder] Permission request result: ${status}`);

      if (status !== 'granted') {
        console.log('[HospitalFinder] Location permission denied by user');
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return false;
      }

      console.log('[HospitalFinder] Location permission granted');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request location permission';
      console.error(`[HospitalFinder] Permission request error: ${message}`);
      setErrorMsg(message);
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * Get the current GPS location with fallback strategy
   */
  const refreshLocation = useCallback(async (): Promise<void> => {
    console.log('[HospitalFinder] Refreshing GPS location...');
    try {
      setLoading(true);
      setErrorMsg(null);

      // Check if we have permission first
      console.log('[HospitalFinder] Checking location permission status...');
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      console.log(`[HospitalFinder] Current permission status: ${status}`);

      if (status !== 'granted') {
        console.log('[HospitalFinder] Cannot get location - permission not granted');
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Use the fallback strategy to get location
      const locationData = await fetchLocationWithFallback();
      setLocation(locationData);
      setErrorMsg(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get current location';
      console.error(`[HospitalFinder] GPS location fetch error: ${message}`);
      setErrorMsg(message);
    } finally {
      setLoading(false);
      console.log('[HospitalFinder] Location refresh completed');
    }
  }, []);

  /**
   * Initialize location on mount
   */
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      console.log('[HospitalFinder] Initializing location services...');
      try {
        // Check existing permission
        console.log('[HospitalFinder] Checking existing permission status...');
        const { status } = await Location.getForegroundPermissionsAsync();
        console.log(`[HospitalFinder] Existing permission status: ${status}`);
        
        if (isMounted) {
          setPermissionStatus(status);
        }

        if (status === 'granted') {
          // If we already have permission, get location using fallback strategy
          console.log('[HospitalFinder] Permission already granted, fetching location...');
          const locationData = await fetchLocationWithFallback();

          if (isMounted) {
            console.log(`[HospitalFinder] Initial location acquired: lat=${locationData.latitude.toFixed(6)}, lng=${locationData.longitude.toFixed(6)}`);
            setLocation(locationData);
            setLoading(false);
          }
        } else if (status === 'undetermined') {
          // If permission hasn't been asked yet, request it
          console.log('[HospitalFinder] Permission undetermined, requesting permission...');
          const granted = await requestPermission();
          if (granted && isMounted) {
            console.log('[HospitalFinder] Permission granted after request, fetching location...');
            await refreshLocation();
          }
        } else {
          // Permission was denied
          console.log('[HospitalFinder] Permission was previously denied');
          if (isMounted) {
            setErrorMsg('Permission to access location was denied');
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Failed to initialize location';
          console.error(`[HospitalFinder] Location initialization error: ${message}`);
          setErrorMsg(message);
          setLoading(false);
        }
      }
    };

    initLocation();

    return () => {
      console.log('[HospitalFinder] Location hook cleanup');
      isMounted = false;
    };
  }, [requestPermission, refreshLocation]);

  return {
    location,
    errorMsg,
    loading,
    permissionStatus,
    requestPermission,
    refreshLocation,
  };
}