import React from 'react';
import { StyleSheet } from 'react-native';
import SplashScreen from '../src/components/SplashScreen';

const AppSplashScreen: React.FC = () => {
  return <SplashScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppSplashScreen;