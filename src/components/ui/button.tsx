import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/lib/colors';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  style?: ViewStyle;
  onClick?: () => void;
  onPress?: () => void;
}

export const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ children, variant = 'default', size = 'default', disabled = false, style, onClick, onPress, ...props }, ref) => {
    const handlePress = () => {
      if (onClick) onClick();
      if (onPress) onPress();
    };

    const buttonStyle = [
      styles.base,
      styles[variant],
      size === 'default' ? styles.sizeDefault : styles[size],
      disabled && styles.disabled,
      style
    ];

    const textStyle = [
      styles.text,
      styles[`${variant}Text`],
      size === 'default' ? styles.sizeDefaultText : styles[`${size}Text`],
      disabled && styles.disabledText
    ];

    return (
      <TouchableOpacity
        ref={ref}
        style={buttonStyle}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    flexDirection: 'row',
  },
  
  // Variants
  default: {
    backgroundColor: colors.primary.DEFAULT,
  },
  destructive: {
    backgroundColor: colors.destructive.DEFAULT,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondary: {
    backgroundColor: colors.secondary.DEFAULT,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  link: {
    backgroundColor: colors.transparent,
  },
  
  // Sizes
  sizeDefault: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  icon: {
    padding: 8,
    minHeight: 40,
    minWidth: 40,
  },
  
  // Text styles
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Variant text colors
  defaultText: {
    color: colors.primary.foreground,
  },
  destructiveText: {
    color: colors.destructive.foreground,
  },
  outlineText: {
    color: colors.foreground,
  },
  secondaryText: {
    color: colors.secondary.foreground,
  },
  ghostText: {
    color: colors.foreground,
  },
  linkText: {
    color: colors.primary.DEFAULT,
  },
  
  // Size text styles
  sizeDefaultText: {
    fontSize: 14,
  },
  smText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 16,
  },
  iconText: {
    fontSize: 14,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
