import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/lib/colors';

export interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function AppLogo({ size = 'md', style }: AppLogoProps) {
  return (
    <View style={[styles.logo, styles[size], style]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>HN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 8,
  },
  text: {
    color: colors.primary.foreground,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Sizes
  sm: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  md: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  lg: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  
  // Size text styles
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 20,
  },
});
