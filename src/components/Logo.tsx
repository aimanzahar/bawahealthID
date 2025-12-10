import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 120, color = '#FFFFFF', showText = true }) => {
  const logoStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textContainerStyle = {
    width: size * 0.8,
    height: size * 0.8,
    borderRadius: (size * 0.8) / 2,
  };

  const textStyle = {
    fontSize: size / 3.5,
  };

  return (
    <View style={[styles.container, logoStyle]}>
      <LinearGradient
        colors={['#0A6EBD', '#1E88E5', '#42A5F5']}
        style={[styles.gradient, logoStyle]}
      >
        <View style={[styles.innerCircle, textContainerStyle]}>
          <LinearGradient
            colors={['#FFFFFF', '#F5F5F5']}
            style={[styles.textContainer, textContainerStyle]}
          >
            <Text style={[styles.logoText, textStyle]}>BH</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
      {showText && <Text style={styles.brandName}>BawaHealth</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    shadowColor: '#0A6EBD',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  innerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '900',
    color: '#0A6EBD',
    letterSpacing: 2,
  },
  brandName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#0A6EBD',
    letterSpacing: 1,
  },
});

export default Logo;