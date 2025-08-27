import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, getIntentColor } from '@/lib/colors';

// UI intent values (what users see)
export type Intent = 'dating' | 'friendship' | 'networking';

// Database intent values (what gets stored)
export type DatabaseIntent = 'casual' | 'serious' | 'friends' | 'networking';

interface IntentBadgeProps {
  intent: Intent | DatabaseIntent;
  size?: 'sm' | 'md' | 'lg';
}

export function IntentBadge({ intent, size = 'md' }: IntentBadgeProps) {
  // Map database values to UI display values
  const getDisplayText = (intent: Intent | DatabaseIntent): string => {
    switch (intent) {
      case 'casual':
        return 'Dating';
      case 'serious':
        return 'Serious Dating';
      case 'friends':
        return 'Friendship';
      case 'networking':
        return 'Networking';
      case 'dating':
        return 'Dating';
      case 'friendship':
        return 'Friendship';
      default:
        return String(intent).charAt(0).toUpperCase() + String(intent).slice(1);
    }
  };

  // Map to UI intent for color purposes
  const getColorIntent = (intent: Intent | DatabaseIntent): Intent => {
    switch (intent) {
      case 'casual':
      case 'serious':
      case 'dating':
        return 'dating';
      case 'friends':
      case 'friendship':
        return 'friendship';
      case 'networking':
        return 'networking';
      default:
        return 'dating';
    }
  };

  const backgroundColor = getIntentColor(getColorIntent(intent));
  const displayText = getDisplayText(intent);
  
  return (
    <View style={[styles.badge, { backgroundColor }, styles[size]]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lg: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  // Size text styles
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 14,
  },
});
