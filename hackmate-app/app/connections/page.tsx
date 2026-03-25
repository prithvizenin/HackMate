'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, UserMinus, Loader2, Mail, GraduationCap, Briefcase, ExternalLink } from 'lucide-react';

export default function Connections() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchConnections = useCallback(async () => {
    try {
      const res = await api.get('/api/connections');
      setConnections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchConnections();
  }, [user, authLoading, router, fetchConnections]);

  const handleRemove = async (id: number) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    try {
      await api.delete(`/api/connections/${id}`);
      setConnections(connections.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to remove connection');
    }
  };

  if (authLoading || (loading && connections.length === 0)) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-10 bg-white">
      <Loader2 className="w-16 h-16 animate-spin text-black mb-4" />
      <span className="font-black uppercase tracking-widest text-2xl text-black">RETRIEVING SQUAD...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-cyan-400 brutal-border brutal-shadow animate-float opacity-50 hidden md:block" />
      <div className="absolute bottom-10 left-0 w-48 h-48 bg-lime-400 brutal-border brutal-shadow animate-float rotate-12 opacity-50 hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        <div className="mb-12 animate-fade-in-up">
          <div className="inline-block bg-yellow-400 border-4 border-black brutal-shadow px-6 py-2 mb-6 -rotate-2">
            <span className="font-black text-black uppercase tracking-widest text-lg">Your Personal Network</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase leading-none drop-shadow-[6px_6px_0_#fff]">
            My <span className="text-pink-500 stroke-black drop-shadow-[6px_6px_0_#000]">Connections</span>
          </h1>
          <p className="mt-6 text-xl text-black font-extrabold max-w-2xl bg-white border-4 border-black p-4 brutal-shadow-sm">
            Total {connections.length} hackmates ready to ship.
          </p>
        </div>

        {connections.length === 0 ? (
          <div className="brutal-card bg-white p-20 text-center animate-fade-in-up mt-10">
            <div className="inline-flex items-center justify-center p-6 bg-gray-100 border-4 border-black brutal-shadow mb-8 rotate-3">
              <UserMinus className="h-20 w-20 text-black" />
            </div>
            <h3 className="text-4xl font-black text-black uppercase mb-4">Solo Player!</h3>
            <p className="text-lg text-black font-bold mb-10 max-w-md mx-auto">You haven&apos;t connected with anyone yet. Head over to the Directory to find your dream team.</p>
            <Link href="/browse" className="inline-block bg-lime-400 text-black border-4 border-black px-10 py-5 font-black uppercase tracking-widest text-xl hover:bg-lime-300 transition-all brutal-btn group">
              BROWSE HACKERS <ExternalLink className="inline-block ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {connections.map((conn, i) => (
              <div 
                key={conn.id} 
                className="brutal-card bg-white overflow-hidden animate-fade-in-up hover:-translate-y-2 transition-transform duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 bg-lime-400 border-4 border-black brutal-shadow flex items-center justify-center text-black rotate-6 group-hover:rotate-0 transition-transform">
                        <User className="h-10 w-10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-black uppercase leading-none mb-2">
                          {conn.name}
                        </h3>
                        <div className="flex items-center text-sm font-bold bg-gray-100 border-2 border-black px-2 py-1 w-fit">
                          <Mail className="h-4 w-4 mr-2" />
                          {conn.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-lg font-black text-black uppercase tracking-tight">
                      <Briefcase className="h-5 w-5 mr-3 text-cyan-500" />
                      {conn.role}
                    </div>
                    <div className="flex items-center text-lg font-black text-black uppercase tracking-tight">
                      <GraduationCap className="h-5 w-5 mr-3 text-pink-500" />
                      {conn.college}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t-4 border-black border-dashed">
                    <Link 
                      href={`/profile/${conn.id}`}
                      className="flex-1 bg-cyan-400 text-black text-center border-4 border-black px-6 py-4 font-black uppercase tracking-widest hover:bg-cyan-300 transition-all brutal-shadow-smactive:translate-y-1"
                    >
                      VIEW PROFILE
                    </Link>
                    <button 
                      onClick={() => handleRemove(conn.id)}
                      className="bg-red-400 text-black border-4 border-black px-6 py-4 font-black uppercase tracking-widest hover:bg-red-500 transition-all brutal-shadow-sm active:translate-y-1 flex items-center justify-center gap-2"
                    >
                      <UserMinus className="h-5 w-5" /> REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
