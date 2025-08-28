# SpotSwipe (formerly Here Now)

A location-based social networking app built with React Native and Expo.

## Recent Updates

### Photo Carousel Component
- **New**: Added `PhotoCarousel` component with swipeable photos and dots indicator
- **Features**: 
  - Left/right swipe through multiple photos
  - Dots showing current photo position
  - Auto-play capability (optional)
  - Responsive design for mobile
- **Usage**: Integrated into Profile preview and SwipeDeck for consistent UI

### Map Loading Optimization
- **Progressive Loading**: Map now shows approximate location first, then refines
- **Faster Initial Display**: Uses low-accuracy location initially for quick map loading
- **Background Refinement**: Gets high-accuracy location in background without blocking UI
- **Zone Loading States**: Added loading indicators for zones to improve perceived performance

### Profile Preview Improvements
- **Photo Carousel**: Profile preview now shows all photos with swipeable interface
- **Consistent Design**: Matches web app profile card design exactly
- **Preview Button**: Easy access to see how your profile appears to others
- **Multiple Photos**: Support for up to 6 photos with proper display

## Features

- **Location-based Zones**: Discover and enter zones (cafes, bars, restaurants, etc.)
- **Profile Management**: Create and edit profiles with multiple photos
- **Intent-based Matching**: Dating, friendship, and networking intents
- **Age Range Preferences**: Set age preferences for each intent type
- **Real-time Location**: Uses Mapbox for accurate location services
- **Photo Management**: Upload and manage multiple profile photos

## Technical Stack

- **Frontend**: React Native with Expo
- **Maps**: Mapbox integration
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for photos
- **Navigation**: Expo Router

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Environment Variables

Create a `.env` file with:
```
MAPBOX_PUBLIC_TOKEN=your_mapbox_token_here
```

## Database Schema

The app uses Supabase with the following key tables:
- `profiles`: User profile information
- `zones`: Location-based zones
- `matches`: User matches
- `messages`: Chat messages

## Photo Requirements

- **Minimum**: 2 photos required
- **Maximum**: 6 photos supported
- **Format**: JPG/PNG
- **Aspect Ratio**: 1:1 (square) recommended
- **Storage**: Photos stored in Supabase Storage
