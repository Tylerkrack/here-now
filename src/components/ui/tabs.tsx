import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/lib/colors';

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Tabs({ defaultValue, value, onValueChange, children, style }: TabsProps) {
  const [activeTab, setActiveTab] = useState(value || defaultValue || '');
  
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    if (onValueChange) {
      onValueChange(tabValue);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TabsList) {
            return React.cloneElement(child, {
              activeTab,
              onTabChange: handleTabChange,
              ...(child.props as any)
            });
          } else if (child.type === TabsContent) {
            return React.cloneElement(child, {
              activeTab,
              ...(child.props as any)
            });
          }
        }
        return child;
      })}
    </View>
  );
}

export interface TabsListProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function TabsList({ children, style }: TabsListProps) {
  return (
    <View style={[styles.tabsList, style]}>
      {children}
    </View>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  style?: ViewStyle;
}

export function TabsTrigger({ value, children, activeTab, onTabChange, style }: TabsTriggerProps) {
  const isActive = activeTab === value;
  
  return (
    <TouchableOpacity
      style={[
        styles.trigger,
        isActive && styles.triggerActive,
        style
      ]}
      onPress={() => onTabChange?.(value)}
    >
      <Text style={[
        styles.triggerText,
        isActive && styles.triggerTextActive
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  style?: ViewStyle;
}

export function TabsContent({ value, children, activeTab, style }: TabsContentProps) {
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: colors.secondary.DEFAULT,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  trigger: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.muted.foreground,
  },
  triggerTextActive: {
    color: colors.foreground,
  },
  content: {
    flex: 1,
  },
});
