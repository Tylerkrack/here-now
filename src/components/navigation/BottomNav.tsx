import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from "@/components/ui/button";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/lib/colors';

interface BottomNavProps {
  activeTab: "map" | "matches" | "profile";
  onTabChange: (tab: "map" | "matches" | "profile") => void;
  unreadCount?: number;
}

export function BottomNav({ activeTab, onTabChange, unreadCount = 0 }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: "map" as const, label: "Discover", icon: "🗺️" },
    { id: "matches" as const, label: "Matches", icon: "❤️" },
    { id: "profile" as const, label: "Profile", icon: "👤" },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
                          <Button
                key={tab.id}
                variant="ghost"
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onClick={() => onTabChange(tab.id)}
              >
              <View style={styles.tabContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>{tab.icon}</Text>
                  {tab.id === "matches" && unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.tabLabel,
                  isActive ? styles.activeTabLabel : null
                ]}>
                  {tab.label}
                </Text>
              </View>
            </Button>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: 64,
    borderRadius: 0,
    backgroundColor: colors.transparent,
    borderWidth: 0,
  },
  activeTabButton: {
    backgroundColor: colors.transparent,
  },
  tabContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  iconText: {
    fontSize: 20,
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.destructive.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 12,
    color: colors.muted.foreground,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: colors.primary.DEFAULT,
  },
});