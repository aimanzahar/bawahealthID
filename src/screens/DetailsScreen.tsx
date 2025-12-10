import React, { useState } from 'react';
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
import { RootStackParamList } from '../navigation/types';
import Logo from '../components/Logo';

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
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock health data
  const healthRecords: HealthRecord[] = [
    {
      id: '1',
      date: '15 Jan 2024',
      hospital: 'Hospital Kuala Lumpur',
      diagnosis: 'Annual Health Checkup',
      doctor: 'Dr. Ahmad Rahman',
      type: 'consultation',
    },
    {
      id: '2',
      date: '10 Jan 2024',
      hospital: 'KPJ Damansara Specialist Hospital',
      diagnosis: 'Complete Blood Count',
      doctor: 'Dr. Sarah Lim',
      type: 'lab-result',
    },
    {
      id: '3',
      date: '05 Jan 2024',
      hospital: 'Subang Jaya Medical Centre',
      diagnosis: 'Hypertension Management',
      doctor: 'Dr. Kumar Raju',
      type: 'prescription',
    },
    {
      id: '4',
      date: '28 Dec 2023',
      hospital: 'Pantai Hospital Ampang',
      diagnosis: 'Chest X-Ray',
      doctor: 'Dr. Tan Mei Ling',
      type: 'lab-result',
    },
  ];

  const vitalSigns = [
    { label: 'Blood Pressure', value: '120/80 mmHg', status: 'normal', icon: '💓' },
    { label: 'Heart Rate', value: '72 bpm', status: 'normal', icon: '❤️' },
    { label: 'Temperature', value: '36.8°C', status: 'normal', icon: '🌡️' },
    { label: 'Oxygen Sat', value: '98%', status: 'normal', icon: '💨' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'records', label: 'Records' },
    { id: 'medications', label: 'Medications' },
  ];

  const renderContent = () => {
    if (itemId === 'health-profile') {
      return (
        <View style={styles.profileContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Logo size={100} showText={false} />
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileId}>Digital ID: 920101-01-1234</Text>
            <View style={styles.profileBadges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Verified</Text>
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
                    <Text style={styles.infoValue}>32 years</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>Male</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Blood Type</Text>
                    <Text style={styles.infoValue}>O+</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Weight</Text>
                    <Text style={styles.infoValue}>75 kg</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Height</Text>
                    <Text style={styles.infoValue}>175 cm</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>BMI</Text>
                    <Text style={styles.infoValue}>24.5</Text>
                  </View>
                </View>
              </View>

              {/* Emergency Contact */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.contactCard}>
                  <Text style={styles.contactName}>Jane Doe</Text>
                  <Text style={styles.contactRelation}>Wife</Text>
                  <Text style={styles.contactPhone}>+60 12-345 6789</Text>
                </View>
              </View>

              {/* Vital Signs */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Latest Vital Signs</Text>
                <View style={styles.vitalsGrid}>
                  {vitalSigns.map((vital, index) => (
                    <View key={index} style={styles.vitalCard}>
                      <Text style={styles.vitalIcon}>{vital.icon}</Text>
                      <Text style={styles.vitalValue}>{vital.value}</Text>
                      <Text style={styles.vitalLabel}>{vital.label}</Text>
                      <View style={styles.vitalStatus} />
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {selectedTab === 'records' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Records</Text>
              {healthRecords.map((record) => (
                <TouchableOpacity key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>{record.date}</Text>
                    <View style={[styles.recordType, styles[record.type]]}>
                      <Text style={[styles.recordTypeText, styles[record.type]]}>
                        {record.type.replace('-', ' ')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recordHospital}>{record.hospital}</Text>
                  <Text style={styles.recordDiagnosis}>{record.diagnosis}</Text>
                  <Text style={styles.recordDoctor}>Dr. {record.doctor}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedTab === 'medications' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Medications</Text>
              <View style={styles.medicationCard}>
                <Text style={styles.medicationName}>Amlodipine 5mg</Text>
                <Text style={styles.medicationDosage}>Once daily</Text>
                <Text style={styles.medicationPurpose}>For blood pressure</Text>
                <Text style={styles.medicationDoctor}>Prescribed by Dr. Kumar Raju</Text>
              </View>
              <View style={styles.medicationCard}>
                <Text style={styles.medicationName}>Vitamin D3 1000 IU</Text>
                <Text style={styles.medicationDosage}>Once daily</Text>
                <Text style={styles.medicationPurpose}>Supplement</Text>
                <Text style={styles.medicationDoctor}>Prescribed by Dr. Ahmad Rahman</Text>
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
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  badgeTextPrimary: {
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
});

export default DetailsScreen;