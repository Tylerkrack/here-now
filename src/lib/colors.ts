// Color system matching the original web app exactly
// These are the HSL values converted to hex for React Native

export const colors = {
  // Base colors
  background: '#ffffff',
  foreground: '#1f2937',
  
  // Card system
  card: '#ffffff',
  cardForeground: '#1f2937',
  
  // Popovers
  popover: '#ffffff',
  popoverForeground: '#1f2937',
  
  // Intent-based color system (exact HSL matches)
  dating: {
    DEFAULT: '#ec4899', // hsl(340 75% 55%)
    foreground: '#ffffff',
    light: '#fce7f3' // hsl(340 65% 92%)
  },
  networking: {
    DEFAULT: '#3b82f6', // hsl(217 91% 60%)
    foreground: '#ffffff',
    light: '#eff6ff' // hsl(217 85% 92%)
  },
  friendship: {
    DEFAULT: '#10b981', // hsl(142 71% 45%)
    foreground: '#ffffff',
    light: '#ecfdf5' // hsl(142 65% 92%)
  },
  
  // Primary system (dating by default)
  primary: {
    DEFAULT: '#ec4899', // hsl(340 75% 55%)
    foreground: '#ffffff'
  },
  
  // Secondary system
  secondary: {
    DEFAULT: '#f1f5f9', // hsl(220 14% 96%)
    foreground: '#1f2937' // hsl(220 13% 13%)
  },
  
  // Muted system
  muted: {
    DEFAULT: '#f1f5f9', // hsl(220 14% 96%)
    foreground: '#6b7280' // hsl(220 9% 46%)
  },
  
  // Accent system
  accent: {
    DEFAULT: '#ec4899', // hsl(340 75% 55%)
    foreground: '#ffffff'
  },
  
  // Destructive
  destructive: {
    DEFAULT: '#dc2626', // hsl(0 84% 60%)
    foreground: '#ffffff'
  },
  
  // Borders and inputs
  border: '#e5e7eb', // hsl(220 13% 91%)
  input: '#e5e7eb', // hsl(220 13% 91%)
  ring: '#ec4899', // hsl(340 75% 55%)
  
  // Additional utility colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Gray scale (matching Tailwind)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
} as const;

// Helper function to get intent color
export const getIntentColor = (intent: string) => {
  switch (intent) {
    case 'dating': return colors.dating.DEFAULT;
    case 'friendship': return colors.friendship.DEFAULT;
    case 'networking': return colors.networking.DEFAULT;
    default: return colors.dating.DEFAULT;
  }
};

// Helper function to get intent light color
export const getIntentLightColor = (intent: string) => {
  switch (intent) {
    case 'dating': return colors.dating.light;
    case 'friendship': return colors.friendship.light;
    case 'networking': return colors.networking.light;
    default: return colors.dating.light;
  }
}; 