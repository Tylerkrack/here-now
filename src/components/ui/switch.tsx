import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '@/lib/colors';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, disabled = false }: SwitchProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        checked && styles.containerChecked,
        disabled && styles.disabled
      ]}
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.thumb,
        checked && styles.thumbChecked
      ]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    padding: 2,
    justifyContent: 'center',
  },
  containerChecked: {
    backgroundColor: colors.primary.DEFAULT,
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    transform: [{ translateX: 0 }],
  },
  thumbChecked: {
    transform: [{ translateX: 20 }],
  },
});
