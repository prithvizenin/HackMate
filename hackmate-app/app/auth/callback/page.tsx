'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/db';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkProfile = async () => {
      // 1. Wait for Supabase session to complete (handled by AuthContext / hash fragment)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Automatically redirects to login if no session is captured
        setTimeout(() => {
          if (active) router.push('/login');
        }, 3000);
        return;
      }

      // 2. AuthContext executes auto-sync, wait briefly to ensure it resolves or just fetch current state
      try {
        const { data: userData, error: userError } = await supabase.from('users')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user profile:", userError);
          if (active) router.push('/browse'); // default fallback
          return;
        }

        if (userData) {
          // If the college field is populated, they have filled out the profile
          if (userData.college) {
            router.push('/browse');
          } else {
            router.push('/welcome');
          }
        } else {
          // If totally missing (sync hasn't happened), it's definitely a new user
          router.push('/welcome');
        }
      } catch (err) {
        console.error("Callback check error:", err);
        if (active) router.push('/browse');
      }
    };

    // A small delay to ensure AuthContext's onAuthStateChange has time to parse hash
    // Next.js handles the `#access_token...` fragment and supabase client auto-captures it.
    const timer = setTimeout(() => {
      checkProfile();
    }, 1500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 bg-pink-400 border-b-4 border-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-20"></div>
      
      <div className="bg-white p-10 brutal-card border-4 border-black brutal-shadow flex flex-col items-center animate-fade-in-up relative z-10">
        <Loader2 className="h-16 w-16 text-black animate-spin mb-6" />
        <h2 className="text-3xl font-black uppercase text-black tracking-widest text-center">
          Authenticating
        </h2>
        <p className="mt-4 text-black font-bold text-lg text-center">
          Securing your connection to HackMate...
        </p>
      </div>
    </div>
  );
}
