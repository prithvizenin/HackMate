'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      setTimeout(() => {
        router.push('/profile/setup');
      }, 300);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Email might be in use.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-cyan-400 border-b-4 border-black">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-20"></div>

      {/* Decorative Blobs */}
      <div className="absolute top-20 -left-10 w-32 h-32 bg-pink-400 brutal-border brutal-shadow animate-float rotate-12 hidden md:block" />
      <div className="absolute bottom-20 -right-10 w-40 h-40 bg-yellow-400 brutal-border brutal-shadow animate-float hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md space-y-8 bg-white brutal-card p-10 relative z-10 animate-fade-in-up">
        <div>
          <div className="mx-auto h-16 w-16 bg-lime-400 border-4 border-black brutal-shadow flex items-center justify-center mb-6 rotate-3 hover:-rotate-3 transition-transform">
            <User className="h-8 w-8 text-black" />
          </div>
          <h2 className="mt-2 text-center text-4xl font-black tracking-tight text-black uppercase">
            Create Account
          </h2>
          <p className="mt-2 text-center text-lg text-black font-bold">
            Join the community and find your team
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-400 text-black border-4 border-black brutal-shadow p-4 text-sm font-bold flex items-start animate-fade-in">
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-6">
            <div>
               <label className="block text-sm font-black uppercase tracking-wider text-black mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-black" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full border-3 border-black py-3 pl-11 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all placeholder:text-gray-500 font-bold"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-black mb-2">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full border-3 border-black py-3 pl-11 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all placeholder:text-gray-500 font-bold"
                  placeholder="you@college.edu"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-black mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-black" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full border-3 border-black py-3 pl-11 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all placeholder:text-gray-500 font-bold"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center bg-pink-400 px-4 py-4 text-lg text-black hover:bg-pink-300 disabled:bg-gray-400 transition-all brutal-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  WAITING...
                </>
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
          
          <div className="text-center text-sm font-bold pt-4">
            <span className="text-black">Already have an account? </span>
            <Link href="/login" className="text-cyan-600 hover:text-cyan-500 hover:underline decoration-2 underline-offset-4 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
