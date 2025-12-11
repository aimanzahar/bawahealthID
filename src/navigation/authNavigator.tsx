import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MyDigitalIdRegisterScreen from '../screens/MyDigitalIdRegisterScreen';
import MyDigitalIdLoginScreen from '../screens/MyDigitalIdLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import HospitalFinderScreen from '../screens/HospitalFinderScreen';
import HealthProfileSetup from '../screens/HealthProfileSetup';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  const { user, loading, checkProfileCompletion } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user && !profileChecked) {
      // Check if user has completed their health profile
      checkProfileCompletion().then((result) => {
        setProfileCompleted(result.completed);
        setProfileChecked(true);
      });
    } else if (!user) {
      setProfileChecked(false);
      setProfileCompleted(false);
    }
  }, [user, profileChecked, checkProfileCompletion, refreshKey]);

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setProfileChecked(false);
  };

  if (loading || (user && !profileChecked)) {
    // Show loading screen while checking auth status or profile completion
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is authenticated
        <>
          {!profileCompleted ? (
            <Stack.Screen name="HealthProfileSetup" component={HealthProfileSetup} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="HospitalFinder" component={HospitalFinderScreen} options={{ headerShown: false }} />
            </>
          )}
        </>
      ) : (
        // User is not authenticated
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MyDigitalIdLogin" component={MyDigitalIdLoginScreen} />
          <Stack.Screen name="MyDigitalIdRegister" component={MyDigitalIdRegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});