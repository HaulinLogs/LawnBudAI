import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

export type UserRole = 'user' | 'premium' | 'admin';

export function useRole() {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useSupabaseUser();

  useEffect(() => {
    const fetchRole = async () => {
      try {
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

    if (userLoading) {
      return;
    }

    if (user) {
      fetchRole();
    } else {
      setRole('user');
      setLoading(false);
    }
  }, [user, userLoading]);

  return {
    role,
    loading,
    error,
    isAdmin: role === 'admin',
    isPremium: role === 'premium' || role === 'admin', // admins always have premium access
  };
}
