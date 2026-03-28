'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Check, X, Clock, User, Loader2 } from 'lucide-react';
import { RequestSkeleton } from '@/components/Skeletons';

export default function Requests() {
  const [activeTab, setActiveTab] = useState('incoming');
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchRequests = useCallback(async () => {
    try {
      const [inRes, outRes] = await Promise.all([
        api.get('/api/requests/incoming'),
        api.get('/api/requests/outgoing')
      ]);
      setIncoming(inRes.data);
      setOutgoing(outRes.data);
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
    if (user) fetchRequests();
  }, [user, authLoading, router, fetchRequests]);

  const handleAction = async (id: string, status: string) => {
    setIncoming(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    try {
      await api.put(`/api/requests/${id}`, { status });
      fetchRequests();
    } catch (err) {
      console.error(err);
      fetchRequests();
      alert('Failed to update request');
    }
  };

  if (authLoading || (loading && incoming.length === 0 && outgoing.length === 0)) return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="h-20 w-64 bg-gray-200 brutal-border animate-pulse mb-8" />
      <div className="h-12 w-80 bg-gray-200 brutal-border animate-pulse mb-8" />
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => <RequestSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-20 right-0 w-48 h-48 bg-yellow-400 brutal-border brutal-shadow animate-float hidden md:block" />
      <div className="absolute bottom-20 left-0 w-40 h-40 bg-pink-400 brutal-border brutal-shadow animate-float rotate-12 hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        <h1 className="text-5xl font-black text-black mb-8 tracking-tight uppercase animate-fade-in-up bg-lime-400 inline-block px-4 pt-2 border-4 border-black brutal-shadow -rotate-2">
          Team Requests
        </h1>
        
        <div className="mb-8 animate-fade-in-up mt-6" style={{ animationDelay: '0.1s' }}>
          <nav className="flex space-x-4 bg-gray-100 p-3 border-4 border-black brutal-shadow w-fit mt-4">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`${activeTab === 'incoming' ? 'bg-cyan-400 border-2 border-black brutal-shadow text-black' : 'bg-white border-2 border-transparent text-gray-500 hover:text-black hover:border-black'} px-6 py-3 font-black uppercase tracking-widest transition-all`}
            >
              Incoming ({incoming.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`${activeTab === 'outgoing' ? 'bg-pink-400 border-2 border-black brutal-shadow text-black' : 'bg-white border-2 border-transparent text-gray-500 hover:text-black hover:border-black'} px-6 py-3 font-black uppercase tracking-widest transition-all`}
            >
              Outgoing
            </button>
          </nav>
        </div>

        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'incoming' && (
            incoming.length === 0 ? (
              <div className="brutal-card text-center py-16 bg-white text-black font-black uppercase tracking-widest text-xl">No incoming requests.</div>
            ) : (
              incoming.map(req => (
                <div key={req.id} className="brutal-card p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-yellow-400 border-4 border-black brutal-shadow flex items-center justify-center text-black flex-shrink-0 rotate-3">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-black text-2xl uppercase">
                        <Link href={`/profile/${req.sender_id}`} className="hover:text-pink-500 hover:underline decoration-4 underline-offset-4 transition-colors">{req.name}</Link>
                      </h3>
                      <p className="text-sm font-bold text-gray-800 mt-1 uppercase tracking-wider bg-pink-200 inline-block px-2 border border-black">{req.role} • {req.college}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    {req.status === 'pending' ? (
                      <>
                        <button onClick={() => handleAction(req.id, 'accepted')} className="bg-lime-400 text-black border-3 border-black px-6 py-3 font-black uppercase tracking-widest hover:bg-lime-300 shadow-[4px_4px_0_0_#000] hover:translate-x-1 flex items-center transition-all">
                          <Check className="h-5 w-5 mr-2" /> ACCEPT
                        </button>
                        <button onClick={() => handleAction(req.id, 'declined')} className="bg-red-400 text-black border-3 border-black px-6 py-3 font-black uppercase tracking-widest hover:bg-red-300 shadow-[4px_4px_0_0_#000] hover:translate-x-1 flex items-center transition-all">
                          <X className="h-5 w-5 mr-2" /> DECLINE
                        </button>
                      </>
                    ) : (
                      <span className={`inline-flex items-center px-4 py-2 font-black uppercase tracking-widest border-2 border-black brutal-shadow ${req.status === 'accepted' ? 'bg-lime-400 text-black' : 'bg-red-400 text-black'}`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'outgoing' && (
            outgoing.length === 0 ? (
              <div className="brutal-card text-center py-16 bg-white text-black font-black uppercase tracking-widest text-xl">No outgoing requests.</div>
            ) : (
              outgoing.map(req => (
                <div key={req.id} className="brutal-card p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:-translate-y-1">
                   <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-cyan-400 border-4 border-black brutal-shadow flex items-center justify-center text-black flex-shrink-0 -rotate-3">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-black text-2xl uppercase">
                        <Link href={`/profile/${req.receiver_id}`} className="hover:text-pink-500 hover:underline decoration-4 underline-offset-4 transition-colors">{req.name}</Link>
                      </h3>
                      <p className="text-sm font-bold text-gray-800 mt-1 uppercase tracking-wider bg-cyan-200 inline-block px-2 border border-black">{req.role} • {req.college}</p>
                    </div>
                  </div>

                  <div>
                    {req.status === 'pending' ? (
                      <span className="inline-flex items-center px-4 py-2 font-black uppercase tracking-widest border-2 border-black brutal-shadow bg-yellow-400 text-black">
                        <Clock className="h-5 w-5 mr-2" /> PENDING
                      </span>
                    ) : req.status === 'accepted' ? (
                      <span className="inline-flex items-center px-4 py-2 font-black uppercase tracking-widest border-2 border-black brutal-shadow bg-lime-400 text-black">
                        <Check className="h-5 w-5 mr-2" /> ACCEPTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 font-black uppercase tracking-widest border-2 border-black brutal-shadow bg-red-400 text-black">
                        <X className="h-5 w-5 mr-2" /> DECLINED
                      </span>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
