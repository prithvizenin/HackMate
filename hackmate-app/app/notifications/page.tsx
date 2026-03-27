'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, Clock, Loader2 } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/api/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifs();
  }, [user, authLoading, router]);

  const markAsRead = async (id: number) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      await api.put(`/api/notifications/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      await api.put('/api/notifications/read');
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString();
  };

  if (authLoading || (loading && notifications.length === 0)) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Loader2 className="w-16 h-16 animate-spin text-black" />
      <span className="ml-4 font-black uppercase tracking-widest text-2xl">LOADING...</span>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-40 -left-10 w-48 h-48 bg-cyan-400 brutal-border brutal-shadow animate-float hidden md:block" />
      <div className="absolute top-20 -right-10 w-56 h-56 bg-pink-400 brutal-border brutal-shadow animate-float hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6 animate-fade-in-up">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-yellow-400 border-4 border-black brutal-shadow flex items-center justify-center text-black mr-6 rotate-[-5deg]">
              <Bell className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-black tracking-tight uppercase">Notifications</h1>
              <p className="text-black font-bold mt-2 uppercase tracking-widest bg-white border-2 border-black inline-block px-3 py-1">
                You have <span className="text-pink-500 font-black">{unreadCount}</span> unread messages
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="flex items-center justify-center bg-lime-400 text-black px-6 py-3 font-black uppercase tracking-widest border-3 border-black shadow-[4px_4px_0_0_#000] hover:bg-lime-300 hover:translate-x-1 transition-all"
            >
              <Check className="h-5 w-5 mr-2" /> MARK ALL READ
            </button>
          )}
        </div>

        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {notifications.length === 0 ? (
            <div className="brutal-card text-center py-16 bg-white text-black font-black uppercase tracking-widest text-xl">
              You have no notifications yet.
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`p-6 transition-all border-4 border-black ${notif.is_read ? 'bg-white shadow-[2px_2px_0_0_#000]' : 'bg-pink-100 brutal-shadow -translate-y-1 cursor-pointer'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {!notif.is_read && (
                      <div className="h-4 w-4 bg-lime-400 border-2 border-black rounded-full mt-1 shrink-0 animate-pulse"></div>
                    )}
                    <p className={`text-lg leading-relaxed ${notif.is_read ? 'text-gray-800 font-bold' : 'text-black font-black uppercase tracking-wide'}`}>
                      {notif.message}
                    </p>
                  </div>
                  <span className="flex items-center text-xs font-black uppercase tracking-widest text-black whitespace-nowrap bg-yellow-400 border-2 border-black px-3 py-1.5 shrink-0 shadow-[2px_2px_0_0_#000]">
                    <Clock className="h-4 w-4 mr-2" /> 
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
