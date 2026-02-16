import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { recordSuccessfulLogin, recordFailedLogin } from '@/lib/securityMonitoring';
import { trackAuthEvent } from '@/lib/telemetry';
import { useRole } from '@/hooks/useRole';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { role, isAdmin, isPremium } = useRole();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (!result.error) {
        recordSuccessfulLogin(email);
      } else {
        await recordFailedLogin(email, result.error.message);
      }
      return result;
    } catch (error: any) {
      await recordFailedLogin(email, error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({ email, password });
      if (!result.error) {
        trackAuthEvent('signup');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    trackAuthEvent('logout');
    return supabase.auth.signOut();
  };

  return {
    session,
    loading,
    signIn,
    signUp,
    signOut,
    // Role convenience methods
    role,
    isAdmin,
    isPremium,
  };
}
