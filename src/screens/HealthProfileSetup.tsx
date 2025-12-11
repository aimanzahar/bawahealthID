import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { convex } from '../convex/client';
import { api } from '../../convex/_generated/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HealthProfileSetupNavigationProp = StackNavigationProp<RootStackParamList, 'HealthProfileSetup'>;

const HealthProfileSetup: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, checkProfileCompletion, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Personal Health Information
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');

  // Medical Information
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState('');

  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const commonAllergies = [
    'Penicillin',
    'Peanuts',
    'Shellfish',
    'Latex',
    'Eggs',
    'Milk',
    'Soy',
    'Wheat',
  ];
  const commonConditions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Arthritis',
    'Migraine',
  ];

  useEffect(() => {
    loadExistingProfile();
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    try {
      const profile = await convex.query(api.health.getHealthProfile, { userId: user._id });
      if (profile) {
        // Pre-fill form with existing data
        setDateOfBirth(profile.dateOfBirth || '');
        setGender(profile.gender || '');
        setBloodType(profile.bloodType || '');
        setAllergies(profile.allergies || []);
        setMedicalConditions(profile.medicalConditions || []);
        setEmergencyContactName(profile.emergencyContactName || '');
        setEmergencyContactPhone(profile.emergencyContactPhone || '');
        setEmergencyContactRelation(profile.emergencyContactRelation || '');
      }
    } catch (error) {
      console.error('Error loading existing health profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const addAllergy = (allergy: string) => {
    if (allergy && !allergies.includes(allergy)) {
      setAllergies([...allergies, allergy]);
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addCondition = (condition: string) => {
    if (condition && !medicalConditions.includes(condition)) {
      setMedicalConditions([...medicalConditions, condition]);
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!dateOfBirth || !gender) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!emergencyContactName || !emergencyContactPhone || !emergencyContactRelation) {
      Alert.alert('Error', 'Please provide complete emergency contact information');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      await convex.mutation(api.health.updateHealthProfile, {
        userId: user._id,
        dateOfBirth,
        gender,
        bloodType: bloodType || undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
        medicalConditions: medicalConditions.length > 0 ? medicalConditions : undefined,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
      });

      Alert.alert(
        'Profile Complete',
        'Your health profile has been successfully saved. You can now use all features of the app.',
        [
          {
            text: 'Continue',
            onPress: async () => {
              // Refresh user data to trigger UI update
              await refreshUserData();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save health profile');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your health profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Health Profile</Text>
            <Text style={styles.subtitle}>
              This information is crucial for providing you with the best healthcare experience.
            </Text>
          </View>

          {/* Personal Health Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.genderContainer}>
                {['Male', 'Female'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      gender === option && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === option && styles.genderTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Blood Type (Optional)</Text>
              <View style={styles.bloodTypeContainer}>
                {bloodTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.bloodTypeOption,
                      bloodType === type && styles.bloodTypeOptionSelected,
                    ]}
                    onPress={() => setBloodType(type)}
                  >
                    <Text
                      style={[
                        styles.bloodTypeText,
                        bloodType === type && styles.bloodTypeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Medical Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Allergies (Optional)</Text>
              <View style={styles.allergyContainer}>
                <TextInput
                  style={styles.allergyInput}
                  placeholder="Type and add allergy"
                  value={allergyInput}
                  onChangeText={setAllergyInput}
                  onSubmitEditing={() => addAllergy(allergyInput)}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addAllergy(allergyInput)}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {allergies.length > 0 && (
                <View style={styles.tagContainer}>
                  {allergies.map((allergy, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tag}
                      onPress={() => removeAllergy(index)}
                    >
                      <Text style={styles.tagText}>{allergy}</Text>
                      <Text style={styles.removeTag}>×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.commonTags}>
                <Text style={styles.commonLabel}>Common allergies:</Text>
                <View style={styles.commonTagContainer}>
                  {commonAllergies.map((allergy) => (
                    <TouchableOpacity
                      key={allergy}
                      style={[
                        styles.commonTag,
                        allergies.includes(allergy) && styles.commonTagSelected,
                      ]}
                      onPress={() => addAllergy(allergy)}
                    >
                      <Text style={styles.commonTagText}>{allergy}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Medical Conditions (Optional)</Text>
              <View style={styles.conditionContainer}>
                <TextInput
                  style={styles.allergyInput}
                  placeholder="Type and add condition"
                  value={conditionInput}
                  onChangeText={setConditionInput}
                  onSubmitEditing={() => addCondition(conditionInput)}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addCondition(conditionInput)}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {medicalConditions.length > 0 && (
                <View style={styles.tagContainer}>
                  {medicalConditions.map((condition, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tag}
                      onPress={() => removeCondition(index)}
                    >
                      <Text style={styles.tagText}>{condition}</Text>
                      <Text style={styles.removeTag}>×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.commonTags}>
                <Text style={styles.commonLabel}>Common conditions:</Text>
                <View style={styles.commonTagContainer}>
                  {commonConditions.map((condition) => (
                    <TouchableOpacity
                      key={condition}
                      style={[
                        styles.commonTag,
                        medicalConditions.includes(condition) && styles.commonTagSelected,
                      ]}
                      onPress={() => addCondition(condition)}
                    >
                      <Text style={styles.commonTagText}>{condition}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Emergency contact's full name"
                value={emergencyContactName}
                onChangeText={setEmergencyContactName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="XXX-XXXXXXX"
                value={emergencyContactPhone}
                onChangeText={setEmergencyContactPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Relationship *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Spouse, Parent, Sibling, Friend"
                value={emergencyContactRelation}
                onChangeText={setEmergencyContactRelation}
                autoCapitalize="words"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Complete Health Profile'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            * This information will be used to provide better healthcare services and in case of emergencies.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  genderOptionSelected: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  genderText: {
    fontSize: 16,
    color: '#374151',
  },
  genderTextSelected: {
    color: '#fff',
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bloodTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  bloodTypeOptionSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  bloodTypeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  bloodTypeTextSelected: {
    color: '#fff',
  },
  allergyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  allergyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  conditionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#1e40af',
    marginRight: 4,
  },
  removeTag: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  commonTags: {
    marginTop: 12,
  },
  commonLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  commonTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commonTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  commonTagSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#1e40af',
  },
  commonTagText: {
    fontSize: 12,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});

export default HealthProfileSetup;