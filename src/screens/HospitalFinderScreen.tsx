import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  RefreshControl,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useLocation } from '../hooks/useLocation';
import { calculateDistance, formatDistance, sortByDistance } from '../utils/geo';
import {
  Hospital,
  HospitalWithDistance,
  HospitalType,
  HospitalFilterOptions,
  HospitalSortOption,
  getHospitalMarkerColor,
  getHospitalTypeLabel,
} from '../types/hospital';
import { HospitalCard, openDirections, callHospital } from '../components/HospitalCard';
import { convex } from '../convex/client';
import { api } from '../../convex/_generated/api';
import {
  fetchNearbyHospitals,
  isGooglePlacesConfigured,
  getDefaultSearchRadius
} from '../services/googlePlacesService';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalFinder'>;

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Default location (Kuala Lumpur) for when GPS is unavailable
const DEFAULT_LOCATION = {
  latitude: 3.139003,
  longitude: 101.686855,
};

const HospitalFinderScreen: React.FC<Props> = ({ navigation }) => {
  // Location hook
  const { location, errorMsg, loading: locationLoading, requestPermission, refreshLocation } = useLocation();

  // State for hospitals
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hospitalSource, setHospitalSource] = useState<'google' | 'seeded' | 'none'>('none');

  // Filter and sort state
  const [filters, setFilters] = useState<HospitalFilterOptions>({
    type: 'all',
    emergencyOnly: false,
    searchQuery: '',
  });
  const [sortBy, setSortBy] = useState<HospitalSortOption>('distance');
  const [showFilters, setShowFilters] = useState(false);

  // Selected hospital for detail view
  const [selectedHospital, setSelectedHospital] = useState<HospitalWithDistance | null>(null);
  const [showHospitalDetail, setShowHospitalDetail] = useState(false);

  // Map ref for programmatic control
  const mapRef = useRef<MapView>(null);

  // Current map region
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  /**
   * Fetch hospitals from Convex (seeded data fallback)
   */
  const fetchSeededHospitals = useCallback(async (): Promise<Hospital[]> => {
    console.log('[HospitalFinder] Fetching seeded hospitals from Convex...');
    try {
      const data = await convex.query(api.hospitals.getAllHospitals, {});
      console.log(`[HospitalFinder] Seeded hospitals fetched: ${data.length} hospitals`);
      return data as Hospital[];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch seeded hospitals';
      console.error(`[HospitalFinder] Seeded hospitals fetch error: ${message}`);
      throw error;
    }
  }, []);

  /**
   * Fetch hospitals - tries Google Places API first, falls back to seeded data
   */
  const fetchHospitals = useCallback(async () => {
    console.log('[HospitalFinder] Starting hospital fetch...');
    console.log(`[HospitalFinder] Current location available: ${!!location}`);
    
    try {
      setHospitalsLoading(true);
      setHospitalsError(null);
      
      // Check if we have location for Google Places API
      if (location && isGooglePlacesConfigured()) {
        console.log('[HospitalFinder] Attempting Google Places API fetch...');
        console.log(`[HospitalFinder] User coordinates: lat=${location.latitude}, lng=${location.longitude}`);
        
        try {
          const googleHospitals = await fetchNearbyHospitals(
            location.latitude,
            location.longitude,
            getDefaultSearchRadius()
          );
          
          if (googleHospitals.length > 0) {
            console.log(`[HospitalFinder] Google Places returned ${googleHospitals.length} hospitals`);
            setHospitals(googleHospitals);
            setHospitalSource('google');
            return;
          } else {
            console.log('[HospitalFinder] Google Places returned no results, falling back to seeded data');
          }
        } catch (googleError) {
          const googleErrorMsg = googleError instanceof Error ? googleError.message : 'Google Places API error';
          console.error(`[HospitalFinder] Google Places API failed: ${googleErrorMsg}`);
          console.log('[HospitalFinder] Falling back to seeded hospitals...');
        }
      } else {
        if (!location) {
          console.log('[HospitalFinder] No location available, using seeded hospitals');
        }
        if (!isGooglePlacesConfigured()) {
          console.log('[HospitalFinder] Google Places API not configured, using seeded hospitals');
        }
      }
      
      // Fallback to seeded hospitals from Convex
      const seededHospitals = await fetchSeededHospitals();
      setHospitals(seededHospitals);
      setHospitalSource('seeded');
      console.log(`[HospitalFinder] Using ${seededHospitals.length} seeded hospitals`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch hospitals';
      console.error(`[HospitalFinder] Hospital fetch failed: ${message}`);
      setHospitalsError(message);
      setHospitalSource('none');
    } finally {
      setHospitalsLoading(false);
      console.log('[HospitalFinder] Hospital fetch completed');
    }
  }, [location, fetchSeededHospitals]);

  /**
   * Log location permission and loading state changes
   */
  useEffect(() => {
    console.log(`[HospitalFinder] Location loading state: ${locationLoading}`);
    if (errorMsg) {
      console.log(`[HospitalFinder] Location error: ${errorMsg}`);
    }
  }, [locationLoading, errorMsg]);

  /**
   * Initial data fetch - triggered when location becomes available
   */
  useEffect(() => {
    console.log('[HospitalFinder] Location effect triggered');
    console.log(`[HospitalFinder] Location available: ${!!location}`);
    console.log(`[HospitalFinder] Location loading: ${locationLoading}`);
    
    // Only fetch when we have location OR when loading is complete (to show seeded as fallback)
    if (location || !locationLoading) {
      fetchHospitals();
    }
  }, [location, locationLoading, fetchHospitals]);

  /**
   * Update map region when location changes
   */
  useEffect(() => {
    if (location) {
      console.log(`[Map] Updating map region to user location: lat=${location.latitude}, lng=${location.longitude}`);
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      console.log('[Map] Map region animation started');
    }
  }, [location]);

  /**
   * Calculate distances and apply filters/sorting
   */
  const processedHospitals = useMemo((): HospitalWithDistance[] => {
    console.log(`[HospitalFinder] Processing ${hospitals.length} hospitals...`);
    
    const userLat = location?.latitude ?? DEFAULT_LOCATION.latitude;
    const userLon = location?.longitude ?? DEFAULT_LOCATION.longitude;
    
    console.log(`[HospitalFinder] Using coordinates for distance calc: lat=${userLat}, lng=${userLon}`);

    // Add distance to each hospital
    let result = hospitals.map((hospital) => ({
      ...hospital,
      distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude),
    }));

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      result = result.filter((h) => h.type === filters.type);
    }

    // Apply emergency filter
    if (filters.emergencyOnly) {
      result = result.filter((h) => h.hasEmergency);
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.city.toLowerCase().includes(query) ||
          h.state.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'distance':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }

    console.log(`[HospitalFinder] Processed hospitals: ${result.length} after filters, sorted by ${sortBy}`);
    return result;
  }, [hospitals, location, filters, sortBy]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    console.log('[HospitalFinder] Pull-to-refresh triggered');
    setRefreshing(true);
    await Promise.all([refreshLocation(), fetchHospitals()]);
    setRefreshing(false);
    console.log('[HospitalFinder] Refresh completed');
  };

  /**
   * Handle hospital card press
   */
  const handleHospitalPress = (hospital: HospitalWithDistance) => {
    console.log(`[HospitalFinder] Hospital selected: ${hospital.name}`);
    setSelectedHospital(hospital);
    setShowHospitalDetail(true);
  };

  /**
   * Handle get directions
   */
  const handleGetDirections = (hospital: HospitalWithDistance) => {
    console.log(`[HospitalFinder] Opening directions to: ${hospital.name}`);
    openDirections(hospital.latitude, hospital.longitude, hospital.name);
  };

  /**
   * Handle call hospital
   */
  const handleCallHospital = (hospital: HospitalWithDistance) => {
    const number = hospital.emergencyNumber || hospital.phoneNumber;
    if (number) {
      callHospital(number);
    } else {
      Alert.alert('No Phone Number', 'This hospital does not have a phone number listed.');
    }
  };

  /**
   * Center map on user location
   */
  const centerOnUser = () => {
    console.log('[Map] Center on user requested');
    if (location) {
      console.log(`[Map] Centering on: lat=${location.latitude}, lng=${location.longitude}`);
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current?.animateToRegion(region, 500);
    } else {
      console.log('[Map] Cannot center - no user location available');
    }
  };

  /**
   * Center map on hospital
   */
  const centerOnHospital = (hospital: HospitalWithDistance) => {
    console.log(`[Map] Centering on hospital: ${hospital.name}`);
    const region = {
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      latitudeDelta: LATITUDE_DELTA / 4,
      longitudeDelta: LONGITUDE_DELTA / 4,
    };
    mapRef.current?.animateToRegion(region, 500);
  };

  /**
   * Render filter pills
   */
  const renderFilterPills = () => {
    const hospitalTypes: (HospitalType | 'all')[] = ['all', 'government', 'private', 'clinic', 'specialist'];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterPillsContainer}
        contentContainerStyle={styles.filterPillsContent}
      >
        {hospitalTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterPill,
              filters.type === type && styles.filterPillActive,
            ]}
            onPress={() => setFilters({ ...filters, type })}
          >
            <Text
              style={[
                styles.filterPillText,
                filters.type === type && styles.filterPillTextActive,
              ]}
            >
              {type === 'all' ? 'All' : getHospitalTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.filterPill,
            filters.emergencyOnly && styles.emergencyPillActive,
          ]}
          onPress={() => setFilters({ ...filters, emergencyOnly: !filters.emergencyOnly })}
        >
          <Text
            style={[
              styles.filterPillText,
              filters.emergencyOnly && styles.emergencyPillTextActive,
            ]}
          >
            🚨 Emergency
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /**
   * Render sort options
   */
  const renderSortOptions = () => {
    const sortOptions: { value: HospitalSortOption; label: string }[] = [
      { value: 'distance', label: 'Nearest' },
      { value: 'name', label: 'Name' },
      { value: 'rating', label: 'Rating' },
    ];

    return (
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortButton,
              sortBy === option.value && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy(option.value)}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === option.value && styles.sortButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Handle requesting location permission
   */
  const handleRequestPermission = async () => {
    console.log('[HospitalFinder] User requesting location permission');
    const granted = await requestPermission();
    console.log(`[HospitalFinder] Permission request result: ${granted ? 'granted' : 'denied'}`);
  };

  /**
   * Render permission denied state
   */
  const renderPermissionDenied = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.permissionIcon}>📍</Text>
      <Text style={styles.permissionTitle}>Location Permission Required</Text>
      <Text style={styles.permissionText}>
        We need access to your location to show you nearby hospitals.
      </Text>
      <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{hospitalsError || errorMsg}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render hospital detail modal
   */
  const renderHospitalDetailModal = () => {
    if (!selectedHospital) return null;

    return (
      <Modal
        visible={showHospitalDetail}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHospitalDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedHospital.name}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowHospitalDetail(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>
                  {getHospitalTypeLabel(selectedHospital.type)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}{' '}
                  {selectedHospital.postalCode}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>
                  {formatDistance(selectedHospital.distance)}
                </Text>
              </View>

              {selectedHospital.phoneNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{selectedHospital.phoneNumber}</Text>
                </View>
              )}

              {selectedHospital.emergencyNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Emergency:</Text>
                  <Text style={[styles.detailValue, { color: Colors.error }]}>
                    {selectedHospital.emergencyNumber}
                  </Text>
                </View>
              )}

              {selectedHospital.operatingHours && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hours:</Text>
                  <Text style={styles.detailValue}>
                    {selectedHospital.is24Hours ? 'Open 24 Hours' : selectedHospital.operatingHours}
                  </Text>
                </View>
              )}

              {selectedHospital.rating && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rating:</Text>
                  <Text style={styles.detailValue}>⭐ {selectedHospital.rating.toFixed(1)}</Text>
                </View>
              )}

              {selectedHospital.specialties && selectedHospital.specialties.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Specialties</Text>
                  <View style={styles.tagContainer}>
                    {selectedHospital.specialties.map((specialty, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedHospital.facilities && selectedHospital.facilities.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Facilities</Text>
                  <View style={styles.tagContainer}>
                    {selectedHospital.facilities.map((facility, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{facility}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setShowHospitalDetail(false);
                  centerOnHospital(selectedHospital);
                }}
              >
                <Text style={styles.modalActionIcon}>🗺️</Text>
                <Text style={styles.modalActionText}>View on Map</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => handleGetDirections(selectedHospital)}
              >
                <Text style={styles.modalActionIcon}>📍</Text>
                <Text style={styles.modalActionText}>Directions</Text>
              </TouchableOpacity>

              {(selectedHospital.phoneNumber || selectedHospital.emergencyNumber) && (
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.callActionButton]}
                  onPress={() => handleCallHospital(selectedHospital)}
                >
                  <Text style={styles.modalActionIcon}>📞</Text>
                  <Text style={[styles.modalActionText, { color: Colors.success }]}>Call</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Check for permission/loading/error states
  const isLoading = locationLoading || hospitalsLoading;
  const hasError = hospitalsError || (errorMsg && !location);

  console.log(`[HospitalFinder] Render state - isLoading: ${isLoading}, hasError: ${hasError}, hospitals: ${hospitals.length}`);
  console.log(`[HospitalFinder] Hospital source: ${hospitalSource}`);

  if (errorMsg && !location && !locationLoading) {
    console.log('[HospitalFinder] Rendering permission denied screen');
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        {renderPermissionDenied()}
      </View>
    );
  }

  if (isLoading && hospitals.length === 0) {
    console.log('[HospitalFinder] Rendering loading screen');
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        {renderLoading()}
      </View>
    );
  }

  if (hasError && hospitals.length === 0) {
    console.log('[HospitalFinder] Rendering error screen');
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        {renderError()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Hospitals</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search hospitals..."
            placeholderTextColor={Colors.text.tertiary}
            value={filters.searchQuery}
            onChangeText={(text) => setFilters({ ...filters, searchQuery: text })}
          />
          {filters.searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setFilters({ ...filters, searchQuery: '' })}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      {renderFilterPills()}

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={mapRegion}
          onRegionChangeComplete={(region) => {
            console.log(`[Map] Region changed: lat=${region.latitude.toFixed(4)}, lng=${region.longitude.toFixed(4)}`);
            setMapRegion(region);
          }}
          onMapReady={() => {
            console.log('[Map] Map ready and initialized');
            console.log('[Map] Provider explicitly set: PROVIDER_GOOGLE');
            console.log('[Map] Platform: ' + Platform.OS);
            console.log('[Map] This should now render Google Maps tiles on Android');
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass
        >
          {/* Hospital Markers */}
          {processedHospitals.map((hospital) => (
            <Marker
              key={hospital._id.toString()}
              coordinate={{
                latitude: hospital.latitude,
                longitude: hospital.longitude,
              }}
              pinColor={getHospitalMarkerColor(hospital.type)}
              onPress={() => {
                setSelectedHospital(hospital);
                centerOnHospital(hospital);
              }}
            >
              <Callout onPress={() => handleHospitalPress(hospital)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {hospital.name}
                  </Text>
                  <Text style={styles.calloutDistance}>
                    {formatDistance(hospital.distance)}
                  </Text>
                  {hospital.hasEmergency && (
                    <Text style={styles.calloutEmergency}>🚨 Emergency</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Center on User Button */}
        <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
          <Text style={styles.centerButtonIcon}>📍</Text>
        </TouchableOpacity>

        {/* Hospital Count Badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {processedHospitals.length} hospital{processedHospitals.length !== 1 ? 's' : ''}
            {hospitalSource === 'google' ? ' 📍' : hospitalSource === 'seeded' ? ' 📋' : ''}
          </Text>
        </View>
      </View>

      {/* Sort Options */}
      {renderSortOptions()}

      {/* Hospital List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {processedHospitals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏥</Text>
            <Text style={styles.emptyTitle}>No hospitals found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or search query.
            </Text>
          </View>
        ) : (
          processedHospitals.map((hospital) => (
            <HospitalCard
              key={hospital._id.toString()}
              hospital={hospital}
              onPress={() => handleHospitalPress(hospital)}
              onGetDirections={() => handleGetDirections(hospital)}
              onCall={() => handleCallHospital(hospital)}
            />
          ))
        )}
      </ScrollView>

      {/* Hospital Detail Modal */}
      {renderHospitalDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: Colors.text.primary,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  // Search
  searchContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: Colors.text.primary,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearButtonText: {
    fontSize: 16,
    color: Colors.text.tertiary,
  },
  // Filter Pills
  filterPillsContainer: {
    backgroundColor: Colors.surface,
    maxHeight: 50,
  },
  filterPillsContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterPillTextActive: {
    color: Colors.text.inverse,
  },
  emergencyPillActive: {
    backgroundColor: Colors.error,
  },
  emergencyPillTextActive: {
    color: Colors.text.inverse,
  },
  // Sort
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: Spacing.sm,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    borderRadius: 8,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary + '20',
  },
  sortButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sortButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Map
  mapContainer: {
    height: height * 0.35,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerButton: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  centerButtonIcon: {
    fontSize: 20,
  },
  countBadge: {
    position: 'absolute',
    left: Spacing.md,
    bottom: Spacing.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  // Callout
  calloutContainer: {
    minWidth: 150,
    padding: Spacing.xs,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  calloutDistance: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  calloutEmergency: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 2,
  },
  // Hospital List
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  // Center States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  // Permission
  permissionIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  // Loading
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  // Error
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.md,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  detailSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  callActionButton: {
    backgroundColor: Colors.success + '15',
  },
  modalActionIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

export default HospitalFinderScreen;