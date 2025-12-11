import React, { useState } from 'react';
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
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { convex } from '../convex/client';
// FIX: Import from the correct Convex-generated API file
import { api } from '../../convex/_generated/api';

type Props = NativeStackScreenProps<RootStackParamList, 'MyDigitalIdRegister'>;

const MyDigitalIdRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();

  // Personal Information
  const [fullName, setFullName] = useState('');
  const [nricNumber, setNricNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('Malaysian');

  // Contact Information
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Address Information
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');

  // Authentication
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const states = [
    'Johor',
    'Kedah',
    'Kelantan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Pulau Pinang',
    'Perak',
    'Perlis',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
    'Kuala Lumpur',
    'Labuan',
    'Putrajaya',
  ];

  const formatNric = (text: string) => {
    const cleaned = text.replace(/[^\d-]/g, '');
    if (cleaned.length <= 6) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 12)}`;
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, '');
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!fullName || !nricNumber || !dateOfBirth || !gender) {
        Alert.alert('Error', 'Please fill in all personal information');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!phoneNumber || !email) {
        Alert.alert('Error', 'Please fill in all contact information');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!address || !city || !postalCode || !state) {
        Alert.alert('Error', 'Please fill in all address information');
        return;
      }
      setStep(4);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('[MyDigitalIdRegister] handleSubmit() called');
    console.log('[MyDigitalIdRegister] Form data - email:', email, 'fullName:', fullName);
    
    if (!password || !confirmPassword) {
      console.log('[MyDigitalIdRegister] Validation failed: password or confirmPassword empty');
      Alert.alert('Error', 'Please enter and confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      console.log('[MyDigitalIdRegister] Validation failed: passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      console.log('[MyDigitalIdRegister] Validation failed: password too short');
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    console.log('[MyDigitalIdRegister] Validation passed, starting registration');
    setLoading(true);
    try {
      // Create user account and capture returned user data directly (fixes stale closure)
      console.log('[MyDigitalIdRegister] Calling register() function...');
      const registeredUser = await register(email, password, fullName);
      console.log('[MyDigitalIdRegister] register() returned:', registeredUser._id);

      // Use returned user data directly - no timeout needed, no stale closure issue
      console.log('[MyDigitalIdRegister] Creating MyDigital ID application...');
      console.log('[MyDigitalIdRegister] userId:', registeredUser._id);
      
      await convex.mutation(api.myDigitalId.createApplication, {
        userId: registeredUser._id,
        fullName,
        nricNumber,
        dateOfBirth,
        gender,
        nationality,
        address,
        city,
        postalCode,
        state,
        phoneNumber,
        email,
      });
      
      console.log('[MyDigitalIdRegister] Application created successfully');

      Alert.alert(
        'Application Submitted',
        'Your MyDigital ID application has been submitted successfully. You will receive a notification once it is verified.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('[MyDigitalIdRegister] Navigating to Home');
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[MyDigitalIdRegister] Error:', error.message);
      console.error('[MyDigitalIdRegister] Full error:', error);
      Alert.alert('Registration Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
      console.log('[MyDigitalIdRegister] handleSubmit() completed');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name (as per NRIC)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>NRIC Number</Text>
        <TextInput
          style={styles.input}
          placeholder="XXXXXXXXXXXX"
          value={nricNumber}
          onChangeText={setNricNumber}
          keyboardType="numeric"
          maxLength={12}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth</Text>
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
        <Text style={styles.label}>Gender</Text>
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
        <Text style={styles.label}>Nationality</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f1f5f9' }]}
          value={nationality}
          editable={false}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Contact Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="XXX-XXXXXXX"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
          keyboardType="phone-pad"
          maxLength={11}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Address Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter your street address"
          value={address}
          onChangeText={setAddress}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXXX"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1.5 }]}>
          <Text style={styles.label}>State</Text>
          <View style={styles.stateContainer}>
            {states.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.stateOption,
                  state === s && styles.stateOptionSelected,
                ]}
                onPress={() => setState(s)}
              >
                <Text
                  style={[
                    styles.stateText,
                    state === s && styles.stateTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create MyDigital ID Password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a strong password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.helperText}>
          Password must be at least 8 characters with uppercase, lowercase, and numbers
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By submitting this application, you confirm that all information provided is accurate and truthful.
          False information may result in legal action under Malaysian law.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/mydigitalid-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>MyDigital ID Registration</Text>
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map((s) => (
                <View key={s} style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressDot,
                      step >= s && styles.progressDotActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressDotText,
                        step >= s && styles.progressDotTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </View>
                  {s < 4 && <View style={styles.progressLine} />}
                </View>
              ))}
            </View>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1, marginRight: 10 }]}
                onPress={handlePrevious}
              >
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {step < 4 ? (
              <TouchableOpacity
                style={[styles.button, { flex: 2 }]}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, { flex: 2 }, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelLink}>Cancel Registration</Text>
            </TouchableOpacity>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: '#1e40af',
  },
  progressDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  progressDotTextActive: {
    color: '#fff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
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
  stateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stateOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  stateOptionSelected: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  stateText: {
    fontSize: 12,
    color: '#374151',
  },
  stateTextSelected: {
    color: '#fff',
  },
  termsContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  cancelLink: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
});

export default MyDigitalIdRegisterScreen;