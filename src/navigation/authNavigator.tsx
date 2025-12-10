import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MyDigitalIdRegisterScreen from '../screens/MyDigitalIdRegisterScreen';
import MyDigitalIdLoginScreen from '../screens/MyDigitalIdLoginScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show loading screen
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is authenticated
        <Stack.Screen name="Home" component={HomeScreen} />
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