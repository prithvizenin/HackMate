'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google login failed:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-pink-400 border-b-4 border-black">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-20"></div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow-400 brutal-border brutal-shadow animate-float rotate-12 hidden md:block" />
      <div className="absolute bottom-20 -right-10 w-40 h-40 bg-cyan-400 brutal-border brutal-shadow animate-float hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md space-y-8 bg-white brutal-card p-10 relative z-10 animate-fade-in-up">
        <div>
          <div className="mx-auto h-16 w-16 bg-lime-400 border-4 border-black brutal-shadow flex items-center justify-center mb-6 -rotate-3 hover:rotate-3 transition-transform">
            <LogIn className="h-8 w-8 text-black" />
          </div>
          <h2 className="mt-2 text-center text-4xl font-black tracking-tight text-black uppercase">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-lg text-black font-bold">
            Sign in to find your next hackathon team
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-400 text-black border-4 border-black brutal-shadow p-4 text-sm font-bold flex items-start animate-fade-in">
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative flex w-full justify-center items-center bg-white border-4 border-black px-4 py-4 text-xl text-black hover:bg-yellow-50 disabled:bg-gray-200 transition-all brutal-shadow-hover font-black uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  CONNECTING...
                </>
              ) : (
                <>
                  <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
            
            <p className="text-center text-sm font-bold text-gray-600 mt-6">
              New to HackMate? No problem! Just sign in with Google to create your account instantly.
            </p>
          </div>
          
          <div className="text-center text-sm font-bold pt-4">
            <Link href="/" className="text-black hover:text-pink-600 hover:underline decoration-2 underline-offset-4 transition-colors uppercase tracking-widest flex items-center justify-center">
              Back to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
