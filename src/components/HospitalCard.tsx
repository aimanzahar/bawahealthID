import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import {
  HospitalWithDistance,
  getHospitalTypeBadgeStyle,
  getHospitalTypeLabel,
} from '../types/hospital';
import { formatDistance } from '../utils/geo';

interface HospitalCardProps {
  hospital: HospitalWithDistance;
  onPress: () => void;
  onGetDirections: () => void;
  onCall: () => void;
}

/**
 * HospitalCard component displays hospital information in a card format
 */
export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onPress,
  onGetDirections,
  onCall,
}) => {
  const typeBadgeStyle = getHospitalTypeBadgeStyle(hospital.type);
  const typeLabel = getHospitalTypeLabel(hospital.type);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.hospitalName} numberOfLines={2}>
            {hospital.name}
          </Text>
          <View style={styles.badgeRow}>
            {/* Type Badge */}
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: typeBadgeStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.typeBadgeText, { color: typeBadgeStyle.textColor }]}>
                {typeLabel}
              </Text>
            </View>

            {/* Emergency Badge */}
            {hospital.hasEmergency && (
              <View style={styles.emergencyBadge}>
                <Text style={styles.emergencyBadgeText}>
                  {hospital.is24Hours ? '24H Emergency' : 'Emergency'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Distance */}
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceValue}>{formatDistance(hospital.distance)}</Text>
          <Text style={styles.distanceLabel}>away</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressIcon}>📍</Text>
        <Text style={styles.addressText} numberOfLines={2}>
          {hospital.address}, {hospital.city}, {hospital.state} {hospital.postalCode}
        </Text>
      </View>

      {/* Operating Hours */}
      {hospital.operatingHours && (
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursIcon}>🕐</Text>
          <Text style={styles.hoursText}>
            {hospital.is24Hours ? 'Open 24 Hours' : hospital.operatingHours}
          </Text>
        </View>
      )}

      {/* Rating */}
      {hospital.rating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingIcon}>⭐</Text>
          <Text style={styles.ratingText}>{hospital.rating.toFixed(1)}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onGetDirections}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonIcon}>🗺️</Text>
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>

        {(hospital.phoneNumber || hospital.emergencyNumber) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={onCall}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>📞</Text>
            <Text style={[styles.actionButtonText, styles.callButtonText]}>
              {hospital.hasEmergency ? 'Emergency' : 'Call'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Opens the device's maps app with directions to the hospital
 */
export function openDirections(latitude: number, longitude: number, name: string): void {
  const scheme = Platform.select({
    ios: 'maps:0,0?q=',
    android: 'geo:0,0?q=',
  });
  const latLng = `${latitude},${longitude}`;
  const label = encodeURIComponent(name);
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });

  if (url) {
    Linking.openURL(url);
  }
}

/**
 * Opens the phone dialer with the hospital's number
 */
export function callHospital(phoneNumber: string): void {
  const url = `tel:${phoneNumber}`;
  Linking.openURL(url);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emergencyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C62828',
  },
  distanceContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  distanceLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  addressIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  hoursIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  hoursText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
  },
  callButton: {
    backgroundColor: Colors.success + '15',
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  callButtonText: {
    color: Colors.success,
  },
});

export default HospitalCard;