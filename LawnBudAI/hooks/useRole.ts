import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'user' | 'premium' | 'admin';

export function useRole() {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole('user');
          setLoading(false);
          return;
        }

        const { data, error: err } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (err) {
          console.error('Failed to fetch user role:', err);
          setError(err.message);
          setRole('user');
        } else if (data) {
          setRole(data.role as UserRole);
        } else {
          setRole('user');
        }
      } catch (err: any) {
        console.error('Error fetching user role:', err);
        setError(err.message);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    // Re-fetch when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    loading,
    error,
    isAdmin: role === 'admin',
    isPremium: role === 'premium' || role === 'admin', // admins always have premium access
  };
}
