import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/ui/app-logo';
import { colors } from '@/lib/colors';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useRouter();

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            age: parseInt(age),
          },
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // After successful signup, go directly to onboarding
        navigate.replace('/onboarding');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        navigate.replace('/');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <AppLogo size="lg" />
          <Text style={styles.title}>Here Now</Text>
          <Text style={styles.subtitle}>Connect with people nearby</Text>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabsList}>
            <TouchableOpacity
              style={[styles.tabTrigger, activeTab === 'signin' && styles.tabTriggerActive]}
              onPress={() => setActiveTab('signin')}
            >
              <Text style={[styles.tabText, activeTab === 'signin' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabTrigger, activeTab === 'signup' && styles.tabTriggerActive]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'signin' && (
            <Card style={styles.card}>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent style={styles.form}>
                <View style={styles.inputGroup}>
                  <Label>Email</Label>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Label>Password</Label>
                  <Input
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
                <Button
                  onPress={handleSignIn}
                  disabled={isLoading}
                  style={styles.button}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'signup' && (
            <Card style={styles.card}>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your details to sign up</CardDescription>
              </CardHeader>
              <CardContent style={styles.form}>
                <View style={styles.inputGroup}>
                  <Label>Email</Label>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Label>Password</Label>
                  <Input
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Label>Display Name</Label>
                  <Input
                    placeholder="Enter your display name"
                    value={displayName}
                    onChangeText={setDisplayName}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Label>Age</Label>
                  <Input
                    placeholder="Enter your age"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
                <Button
                  onPress={handleSignUp}
                  disabled={isLoading}
                  style={styles.button}
                >
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.DEFAULT,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.foreground,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted.foreground,
    marginTop: 8,
  },
  tabsContainer: {
    flex: 1,
  },
  tabsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: colors.muted.DEFAULT,
    borderRadius: 10,
    padding: 4,
  },
  tabTrigger: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  tabTriggerActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.muted.foreground,
  },
  tabTextActive: {
    color: colors.foreground,
  },
  card: {
    marginBottom: 16,
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default Auth;