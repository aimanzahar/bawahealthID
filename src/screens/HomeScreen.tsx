import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import MalaysiaDigitalIDButton from '../components/MalaysiaDigitalIDButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMalaysiaIDLogin = () => {
    setIsLoading(true);

    // Simulate authentication process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Authentication Successful',
        'Welcome to BawaHealth! Your health records are now securely synchronized across all participating hospitals.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Details', { itemId: 'health-profile' })
          }
        ]
      );
    }, 2000);
  };

  const quickActions = [
    {
      id: '1',
      icon: '🏥',
      title: 'Find Hospitals',
      subtitle: 'Locate nearby healthcare facilities',
      color: '#2196F3',
      onPress: () => navigation.navigate('Details', { itemId: 'hospitals' }),
    },
    {
      id: '2',
      icon: '📋',
      title: 'My Records',
      subtitle: 'View your medical history',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Details', { itemId: 'health-profile' }),
    },
    {
      id: '3',
      icon: '💊',
      title: 'Medications',
      subtitle: 'Track your prescriptions',
      color: '#FF9800',
      onPress: () => navigation.navigate('Details', { itemId: 'medications' }),
    },
    {
      id: '4',
      icon: '📅',
      title: 'Appointments',
      subtitle: 'Manage your visits',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Details', { itemId: 'appointments' }),
    },
  ];

  const healthStats = [
    { label: 'Blood Pressure', value: '120/80', icon: '❤️', status: 'normal' },
    { label: 'Last Checkup', value: '2 weeks ago', icon: '🩺', status: 'recent' },
    { label: 'Medications', value: '2 Active', icon: '💊', status: 'active' },
    { label: 'Allergies', value: '1 Recorded', icon: '⚠��', status: 'warning' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A6EBD" />

      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/unnamed.jpg')}
          style={styles.headerBackground}
          blurRadius={80}
        />
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <Logo size={70} showText={false} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.welcomeText}>Welcome to BawaHealth</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Digital ID Login Section */}
        <View style={styles.authSection}>
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>Your Health Passport</Text>
            <Text style={styles.authSubtitle}>Sign in with your Malaysia Digital ID</Text>
          </View>
          <MalaysiaDigitalIDButton
            onPress={handleMalaysiaIDLogin}
            isLoading={isLoading}
          />
          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>🔒 Protected by Bank Negara Malaysia</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
                activeOpacity={0.9}
              >
                <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.statsContainer}>
            {healthStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[
                  styles.statusDot,
                  stat.status === 'normal' && styles.statusNormal,
                  stat.status === 'recent' && styles.statusRecent,
                  stat.status === 'active' && styles.statusActive,
                  stat.status === 'warning' && styles.statusWarning
                ]} />
              </View>
            ))}
          </View>
        </View>

        {/* Features Highlight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why BawaHealth?</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIconText}>✓</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Seamless Hospital Access</Text>
                <Text style={styles.featureDescription}>
                  Your health records follow you to any participating hospital in Malaysia
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIconText}>✓</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Complete Health History</Text>
                <Text style={styles.featureDescription}>
                  All your medical records, prescriptions, and test results in one place
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIconText}>✓</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Emergency Ready</Text>
                <Text style={styles.featureDescription}>
                  Quick access to critical health information during emergencies
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: height * 0.25,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    width: width,
    height: '100%',
    top: 0,
    left: 0,
  },
  headerOverlay: {
    position: 'absolute',
    width: width,
    height: '100%',
    backgroundColor: 'rgba(10, 110, 189, 0.85)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerText: {
    marginLeft: 20,
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF80',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC',
  },
  authSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  authHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  securityBadge: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#0A6EBD',
    fontWeight: '500',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 24,
    color: '#D1D5DB',
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusNormal: { backgroundColor: '#10B981' },
  statusRecent: { backgroundColor: '#3B82F6' },
  statusActive: { backgroundColor: '#F59E0B' },
  statusWarning: { backgroundColor: '#EF4444' },
  featuresList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
    featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default HomeScreen;