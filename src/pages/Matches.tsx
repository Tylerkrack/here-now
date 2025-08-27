import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/navigation/BottomNav';
import { colors } from '@/lib/colors';

export default function Matches() {
  const router = useRouter();
  const { matches, loading } = useMatches();

  const handleBack = () => {
    router.back();
  };

  const handleOpenChat = (matchId: string) => {
    // Navigate to chat screen
    console.log('Opening chat with match:', matchId);
  };

  const handleViewProfile = (matchId: string) => {
    // Navigate to match profile
    console.log('Viewing profile of match:', matchId);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Matches</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - matches web app exactly */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {matches.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CardContent style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>❤️</Text>
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptySubtitle}>
                Start swiping to find people nearby and make connections!
              </Text>
              <Button onClick={() => router.back()}>
                <Text style={styles.emptyButtonText}>Start Discovering</Text>
              </Button>
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <Card key={match.id} style={styles.matchCard}>
              <CardContent style={styles.matchContent}>
                <TouchableOpacity 
                  style={styles.matchInfo}
                  onPress={() => handleViewProfile(match.id)}
                >
                  <Image 
                    source={{ 
                      uri: match.profile?.photos[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                    }} 
                    style={styles.matchPhoto}
                  />
                  <View style={styles.matchDetails}>
                    <View style={styles.matchHeader}>
                      <Text style={styles.matchName}>
                        {match.profile?.display_name || 'Unknown User'}, {match.profile?.age || '?'}
                      </Text>
                      {match.unread_count && match.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {match.unread_count > 9 ? '9+' : match.unread_count}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.matchMeta}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.matchDistance}>
                        {match.zone_id ? 'Met in zone' : 'Met nearby'}
                      </Text>
                    </View>
                    <Text style={styles.matchTime}>
                      Matched {new Date(match.matched_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.matchActions}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewProfile(match.id)}
                    style={styles.viewButton}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleOpenChat(match.id)}
                    style={styles.chatButton}
                  >
                    <Text style={styles.chatButtonText}>💬 Chat</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>
      <BottomNav 
        activeTab="matches"
        onTabChange={(tab) => {
          if (tab === 'map') {
            router.push('/');
          } else if (tab === 'profile') {
            router.push('/profile');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backIcon: {
    fontSize: 20,
    color: colors.foreground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: colors.muted.foreground,
  },
  emptyCard: {
    marginTop: 32,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.muted.foreground,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  matchCard: {
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  matchContent: {
    padding: 16,
  },
  matchInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  matchDetails: {
    flex: 1,
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
    color: colors.foreground,
  },
  unreadBadge: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  matchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  matchDistance: {
    fontSize: 12,
    color: colors.muted.foreground,
  },
  matchTime: {
    fontSize: 12,
    color: colors.gray[400],
  },
  matchActions: {
    flexDirection: 'row',
    // Removed gap property
  },
  viewButton: {
    marginRight: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  chatButton: {
    backgroundColor: colors.primary.DEFAULT,
  },
  chatButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
}); 