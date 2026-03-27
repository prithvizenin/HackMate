'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import supabase from '@/lib/db';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hackmate_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hackmate_token');
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        localStorage.setItem('hackmate_token', session.access_token);
        
        supabase.from('users').select('*').eq('email', session.user.email).single()
          .then(({ data }) => {
            if (data) {
              setUser(data);
              localStorage.setItem('hackmate_user', JSON.stringify(data));
            }
          });
      }
      setLoading(false);
    });

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setToken(session.access_token);
        localStorage.setItem('hackmate_token', session.access_token);
        
        const { data, error } = await supabase.from('users').select('*').eq('email', session.user.email).maybeSingle();
        let userResult = data;
        
        // If user is not in public.users, try to sync now
        if (!userResult && !error && session.user.email) {
           try {
             const res = await api.post('/api/auth/sync', { 
               name: session.user.user_metadata?.name || session.user.email.split('@')[0], 
               email: session.user.email 
             });
             if (res.data && res.data.userId) {
                const { data: retryData } = await supabase.from('users').select('*').eq('id', res.data.userId).single();
                userResult = retryData;
             }
           } catch (syncErr) {
             console.error("Auto-sync failed:", syncErr);
           }
        }

        if (userResult) {
          if (userResult.is_suspended) {
            alert('Your account has been suspended. Please contact support.');
            await supabase.auth.signOut();
            setUser(null);
            setToken(null);
            localStorage.removeItem('hackmate_token');
            localStorage.removeItem('hackmate_user');
            setLoading(false);
            return;
          }

          if (userResult.is_admin) {
            // Unobtrusively set the admin cookie if they are an admin
            fetch('/api/auth/set-admin-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userResult.email })
            }).catch(console.error);
          }

          setUser(userResult);
          localStorage.setItem('hackmate_user', JSON.stringify(userResult));
        }
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('hackmate_token');
        localStorage.removeItem('hackmate_user');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hackmate_token');
      localStorage.removeItem('hackmate_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signInWithGoogle, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
