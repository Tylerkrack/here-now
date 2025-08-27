import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/lib/colors';

export interface LabelProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Label({ children, style }: LabelProps) {
  return (
    <Text style={[styles.label, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
});
