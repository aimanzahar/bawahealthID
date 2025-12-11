import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { convex } from '../convex/client';
import { api } from '../../convex/_generated/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

interface HealthRecord {
  id: string;
  date: string;
  hospital: string;
  diagnosis: string;
  doctor: string;
  type: 'consultation' | 'prescription' | 'lab-result';
}

const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { itemId } = route.params;
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (itemId === 'health-profile' && user) {
      loadHealthProfile();
    } else {
      setLoading(false);
    }
  }, [itemId, user]);

  const loadHealthProfile = async () => {
    try {
      const profile = await convex.query(api.health.getHealthProfile, { userId: user._id });
      setHealthProfile(profile);
    } catch (error) {
      console.error('Error loading health profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Not specified';
    try {
      // Assuming format DD/MM/YYYY
      const parts = dateOfBirth.split('/');
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2]);
      const birthDate = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} years`;
    } catch (error) {
      return 'Not specified';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'records', label: 'Records' },
    { id: 'medications', label: 'Medications' },
  ];

  const renderContent = () => {
    if (itemId === 'health-profile') {
      if (loading) {
        return (
          <View style={[styles.profileContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.emptyStateText}>Loading health profile...</Text>
          </View>
        );
      }

      return (
        <View style={styles.profileContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Logo size={100} showText={false} />
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileId}>
              {user?.nricNumber ? `Digital ID: ${user.nricNumber}` : user?.email || 'User'}
            </Text>
            <View style={styles.profileBadges}>
              <View style={[
                styles.badge,
                user?.verificationStatus === 'verified' ? styles.badgeVerified :
                user?.verificationStatus === 'pending' ? styles.badgePending :
                styles.badgeNotVerified
              ]}>
                <Text style={[
                  styles.badgeText,
                  user?.verificationStatus === 'verified' ? styles.badgeTextVerified :
                  user?.verificationStatus === 'pending' ? styles.badgeTextPending :
                  styles.badgeTextNotVerified
                ]}>
                  {user?.verificationStatus === 'verified' ? 'Verified' :
                   user?.verificationStatus === 'pending' ? 'Pending' :
                   'Not Verified'}
                </Text>
              </View>
              <View style={[styles.badge, styles.badgePrimary]}>
                <Text style={[styles.badgeText, styles.badgeTextPrimary]}>Active</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  selectedTab === tab.id && styles.activeTab
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <>
              {/* Personal Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Age</Text>
                    <Text style={styles.infoValue}>{calculateAge(healthProfile?.dateOfBirth || '')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{healthProfile?.gender || 'Not specified'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Blood Type</Text>
                    <Text style={styles.infoValue}>{healthProfile?.bloodType || 'Not specified'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Date of Birth</Text>
                    <Text style={styles.infoValue}>{healthProfile?.dateOfBirth || 'Not specified'}</Text>
                  </View>
                </View>
              </View>

              {/* Emergency Contact */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.contactCard}>
                  <Text style={styles.contactName}>
                    {healthProfile?.emergencyContactName || 'Not specified'}
                  </Text>
                  <Text style={styles.contactRelation}>
                    {healthProfile?.emergencyContactRelation || 'Not specified'}
                  </Text>
                  <Text style={styles.contactPhone}>
                    {healthProfile?.emergencyContactPhone || 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Vital Signs */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Latest Vital Signs</Text>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📊</Text>
                  <Text style={styles.emptyStateText}>No vital signs recorded yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Your vital signs will appear here once recorded by healthcare providers
                  </Text>
                </View>
              </View>
            </>
          )}

          {selectedTab === 'records' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Records</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📁</Text>
                <Text style={styles.emptyStateText}>No medical records available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your medical records will appear here once you have hospital visits
                </Text>
              </View>
            </View>
          )}

          {selectedTab === 'medications' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Medications</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💊</Text>
                <Text style={styles.emptyStateText}>No current medications</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your prescriptions will appear here once prescribed by healthcare providers
                </Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Text style={styles.title}>Feature Details</Text>
        <Text style={styles.subtitle}>Feature ID: {itemId}</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Details', { itemId: 'health-profile' })}
        >
          <Text style={styles.primaryButtonText}>View Health Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A6EBD" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Profile</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0A6EBD',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  profileId: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  badgePrimary: {
    backgroundColor: '#0A6EBD',
  },
  badgeVerified: {
    backgroundColor: '#10B981',
  },
  badgePending: {
    backgroundColor: '#F59E0B',
  },
  badgeNotVerified: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  badgeTextPrimary: {
    color: '#FFFFFF',
  },
  badgeTextVerified: {
    color: '#FFFFFF',
  },
  badgeTextPending: {
    color: '#FFFFFF',
  },
  badgeTextNotVerified: {
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0A6EBD',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactRelation: {
    fontSize: 16,
    color: '#0A6EBD',
    marginBottom: 8,
  },
  contactPhone: {
    fontSize: 16,
    color: '#6B7280',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  vitalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  vitalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  vitalStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  recordType: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  consultation: {
    backgroundColor: '#DBEAFE',
  },
  prescription: {
    backgroundColor: '#FEF3C7',
  },
  'lab-result': {
    backgroundColor: '#D1FAE5',
  },
  recordTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  consultation: {
    color: '#1E40AF',
  },
  prescription: {
    color: '#92400E',
  },
  'lab-result': {
    color: '#065F46',
  },
  recordHospital: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordDiagnosis: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 4,
  },
  recordDoctor: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 16,
    color: '#0A6EBD',
    fontWeight: '500',
    marginBottom: 4,
  },
  medicationPurpose: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  medicationDoctor: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0A6EBD',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0A6EBD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DetailsScreen;