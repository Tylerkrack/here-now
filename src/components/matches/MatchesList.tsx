import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import AppLogo from "@/components/ui/app-logo";

interface Match {
  id: string;
  name: string;
  age: number;
  image?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  intents: Intent[];
  isOnline: boolean;
}

interface MatchesListProps {
  matches: Match[];
  onChatWith: (matchId: string) => void;
}

export function MatchesList({ matches, onChatWith }: MatchesListProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppLogo />
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search matches..."
          style={styles.searchInput}
        />
      </View>

      {/* Matches List */}
      <ScrollView style={styles.matchesList} showsVerticalScrollIndicator={false}>
        {matches.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchItem}
            onPress={() => onChatWith(match.id)}
          >
            <View style={styles.matchAvatar}>
              {match.image ? (
                <Image source={{ uri: match.image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {match.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {match.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.matchInfo}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchName}>{match.name}, {match.age}</Text>
                {match.unreadCount > 0 && (
                  <Badge variant="destructive" style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{match.unreadCount}</Text>
                  </Badge>
                )}
              </View>

              <View style={styles.intentsContainer}>
                {match.intents.map((intent) => (
                  <IntentBadge key={intent} intent={intent} />
                ))}
              </View>

              {match.lastMessage && (
                <View style={styles.lastMessageContainer}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {match.lastMessage}
                  </Text>
                  {match.lastMessageTime && (
                    <Text style={styles.lastMessageTime}>
                      {match.lastMessageTime}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.matchActions}>
              <Button
                variant="ghost"
                style={styles.chatButton}
                onPress={() => onChatWith(match.id)}
              >
                <Text style={styles.chatButtonText}>Chat</Text>
              </Button>
            </View>
          </TouchableOpacity>
        ))}

        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring zones to find people near you!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    width: '100%',
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  matchAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  intentsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  matchActions: {
    alignItems: 'center',
  },
  chatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chatButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});