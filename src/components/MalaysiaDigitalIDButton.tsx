import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MalaysiaDigitalIDButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

const MalaysiaDigitalIDButton: React.FC<MalaysiaDigitalIDButtonProps> = ({
  onPress,
  isLoading = false
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#0A6EBD', '#1565C0', '#0D47A1']}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.buttonContent}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#E3F2FD']}
              style={styles.logoInner}
            >
              <Text style={styles.logoText}>MY</Text>
            </LinearGradient>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Authenticating...' : 'Malaysia Digital ID'}
            </Text>
            <Text style={styles.buttonSubtext}>Secure Health Access</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    shadowColor: '#0A6EBD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  logoInner: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF20',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A6EBD',
    letterSpacing: 1.5,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    alignItems: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default MalaysiaDigitalIDButton;