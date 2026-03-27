'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyan-400 flex items-center justify-center p-4">
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 brutal-border animate-float" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400 brutal-border rounded-full animate-float" style={{ animationDelay: '1s' }} />

      <div className="bg-white brutal-border brutal-shadow p-8 max-w-md w-full relative z-10 animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-lime-400 border-4 border-black brutal-shadow flex items-center justify-center -rotate-6">
            <Key className="h-8 w-8 text-black" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-center uppercase tracking-tight mb-2">Admin Access</h1>
        <p className="text-center font-bold text-gray-600 mb-8">Enter the master password</p>

        {error && (
          <div className="bg-pink-400 text-black border-4 border-black font-bold p-3 mb-6 uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xl font-black uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white brutal-border p-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 brutal-btn py-4 text-xl font-black uppercase disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
