import React, { useState, useEffect, useMemo } from 'react';
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
import { createAuthStyles } from '@/styles/auth.styles';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type SunExposure } from '@/lib/grassVarieties';

const SUN_OPTIONS: { value: SunExposure; icon: string; label: string; description: string }[] = [
  { value: 'full_sun', icon: '☀️', label: 'Full Sun', description: '6+ hours of direct sunlight daily' },
  { value: 'sun_and_shade', icon: '⛅', label: 'Sun & Shade', description: '4–6 hours, or dappled light under trees' },
  { value: 'dense_shade', icon: '🌑', label: 'Mostly Shade', description: 'Less than 4 hours — dense tree cover or north-facing' },
];

export default function SignUpScreen() {
  const [step, setStep] = useState<'credentials' | 'sunlight'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sunExposure, setSunExposure] = useState<SunExposure>('sun_and_shade');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryMinutes, setRetryMinutes] = useState(0);
  const router = useRouter();
  const themeColors = useAppTheme();
  const styles = useMemo(() => createAuthStyles(themeColors), [themeColors]);
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
    }, 60000);

    return () => clearInterval(interval);
  }, [retryMinutes]);

  const handleCredentialsNext = () => {
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
    setStep('sunlight');
  };

  const handleSignUp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const { data, error: signUpError } = await signUp(email, password);

    if (signUpError) {
      if (signUpError.message?.includes('429') || signUpError.message?.includes('rate limit')) {
        const minutes = 60;
        setRetryMinutes(minutes);
        setError(`Thanks for trying us out! We're currently working on our infrastructure. Please try again in ${minutes} minutes.`);
      } else {
        setError(signUpError.message);
      }
      setStep('credentials');
      setLoading(false);
    } else {
      if (data.user) {
        await supabase.from('user_preferences').insert({
          user_id: data.user.id,
          city: 'Madison',
          state: 'WI',
          timezone: 'America/Chicago',
          grass_type: 'cool_season',
          sun_exposure: sunExposure,
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
          <Text style={styles.subHeaderText}>
            {step === 'credentials' ? 'Get started with LawnBud' : 'About your lawn'}
          </Text>
        </View>

        {step === 'credentials' ? (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={themeColors.placeholderText}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Password"
              placeholderTextColor={themeColors.placeholderText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Confirm Password"
              placeholderTextColor={themeColors.placeholderText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (loading || retryMinutes > 0) && styles.buttonDisabled]}
              onPress={handleCredentialsNext}
              disabled={loading || retryMinutes > 0}
            >
              {retryMinutes > 0 ? (
                <Text style={styles.buttonText}>Try again in {retryMinutes}m</Text>
              ) : (
                <Text style={styles.buttonText}>Next</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={[styles.subHeaderText, { marginBottom: 16, textAlign: 'left' }]}>
              How much sunlight does your lawn get?
            </Text>

            {SUN_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  sunOptionStyle,
                  sunExposure === opt.value && sunOptionActiveStyle,
                ]}
                onPress={() => setSunExposure(opt.value)}
                disabled={loading}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>{opt.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[sunOptionLabelStyle, sunExposure === opt.value && { color: '#fff' }]}>
                    {opt.label}
                  </Text>
                  <Text style={[sunOptionDescStyle, sunExposure === opt.value && { color: '#d1fae5' }]}>
                    {opt.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {error ? <Text style={[styles.error, { marginTop: 12 }]}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonDisabled, { marginTop: 8 }]}
              onPress={() => { setError(''); setStep('credentials'); }}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

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

const sunOptionStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  padding: 14,
  marginBottom: 10,
  backgroundColor: '#f9fafb',
};

const sunOptionActiveStyle = {
  backgroundColor: '#22c55e',
  borderColor: '#22c55e',
};

const sunOptionLabelStyle = {
  fontSize: 15,
  fontWeight: '600' as const,
  color: '#111827',
};

const sunOptionDescStyle = {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 2,
};
