import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView, TouchableOpacity, Text } from 'react-native';
import { colors } from '@/lib/colors';

const { width: screenWidth } = Dimensions.get('window');

interface PhotoCarouselProps {
  photos: string[];
  height?: number;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function PhotoCarousel({ 
  photos, 
  height = 400, 
  showDots = true, 
  autoPlay = false, 
  autoPlayInterval = 3000 
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || photos.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % photos.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, photos.length, autoPlay, autoPlayInterval]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  if (!photos || photos.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No photos</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image
              source={{ uri: photo }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Dots indicator */}
      {showDots && photos.length > 1 && (
        <View style={styles.dotsContainer}>
          {photos.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.gray[100],
  },
  scrollView: {
    flex: 1,
  },
  photoContainer: {
    width: screenWidth,
    height: '100%',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
  },
  placeholderText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
}); 