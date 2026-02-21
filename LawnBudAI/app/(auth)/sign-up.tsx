import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/auth.styles';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryMinutes, setRetryMinutes] = useState(0);
  const router = useRouter();
  const { signUp } = useAuth();

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryMinutes <= 0) return;

    const interval = setInterval(() => {
      setRetryMinutes((prev) => {
        if (prev <= 1) {
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [retryMinutes]);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const { data, error: signUpError } = await signUp(email, password);

    if (signUpError) {
      // Handle rate limit error (429)
      if (signUpError.message?.includes('429') || signUpError.message?.includes('rate limit')) {
        const minutes = 60; // Default to 60 minutes if not specified
        setRetryMinutes(minutes);
        setError(`Thanks for trying us out! We're currently working on our infrastructure. Please try again in ${minutes} minutes.`);
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
    } else {
      // Create default user preferences
      if (data.user) {
        await supabase.from('user_preferences').insert({
          user_id: data.user.id,
          city: 'Madison',
          grass_type: 'cool_season',
        });
      }
      setSuccess('Account created! Check your email to confirm.');
      setTimeout(() => {
        router.replace('/(auth)/sign-in');
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.subHeaderText}>Get started with LawnBud</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (loading || retryMinutes > 0) && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading || retryMinutes > 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : retryMinutes > 0 ? (
              <Text style={styles.buttonText}>Try again in {retryMinutes}m</Text>
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
