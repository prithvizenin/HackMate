'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, Clock, Loader2, X } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
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
        const [notifsRes, annRes] = await Promise.all([
          api.get('/api/notifications'),
          api.get('/api/admin/announcements')
        ]);
        setNotifications(notifsRes.data);
        setAnnouncements(annRes.data);
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
      setNotifications(prev => prev.filter(n => n.id !== id));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      await api.delete(`/api/notifications/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications([]);
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      await api.delete('/api/notifications/read');
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString();
  };

  if (authLoading || (loading && notifications.length === 0)) return (
    <div className="max-w-3xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
        <div className="h-24 w-80 bg-gray-200 brutal-border animate-pulse" />
        <div className="h-12 w-40 bg-gray-200 brutal-border animate-pulse" />
      </div>
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 w-full bg-gray-200 brutal-border animate-pulse" />
        ))}
      </div>
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
            notifications.map(notif => {
              const isAnn = notif.is_announcement || notif.isAnnouncement || notif.type === 'announcement' || (notif.message && notif.message.includes('📢 ANNOUNCEMENT:'));
              const messageText = notif.message.replace('📢 ANNOUNCEMENT: ', '');
              
              return (
              <div 
                key={notif.id} 
                onClick={() => {
                  if (isAnn) {
                    const matched = announcements.find(a => a.title === messageText) || { title: messageText, content: 'Details unavailable.' };
                    setSelectedAnnouncement({ ...matched, notificationId: notif.id, is_read: notif.is_read });
                  } else if (!notif.is_read) {
                    markAsRead(notif.id);
                  }
                }}
                className={`p-6 transition-all border-4 border-black relative mt-4 ${
                  isAnn 
                    ? (notif.is_read ? 'bg-fuchsia-100 shadow-[2px_2px_0_0_#000]' : 'bg-fuchsia-300 brutal-shadow -translate-y-1 cursor-pointer')
                    : (notif.is_read ? 'bg-white shadow-[2px_2px_0_0_#000]' : 'bg-pink-100 brutal-shadow -translate-y-1 cursor-pointer')
                }`}
              >
                {isAnn && (
                  <span className="absolute -top-4 -left-2 bg-yellow-400 text-black text-xs px-3 py-1 uppercase font-black tracking-widest border-2 border-black shadow-[2px_2px_0_0_#000] rotate-[-2deg]">
                    📢 Announcement
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {!notif.is_read && (
                      <div className={`h-4 w-4 rounded-full border-2 border-black mt-1 shrink-0 animate-pulse ${notif.is_announcement ? 'bg-indigo-400' : 'bg-lime-400'}`}></div>
                    )}
                    <p className={`text-lg leading-relaxed ${
                      isAnn 
                        ? (notif.is_read ? 'text-black font-extrabold uppercase' : 'text-black font-black uppercase text-xl')
                        : (notif.is_read ? 'text-gray-800 font-bold' : 'text-black font-black uppercase tracking-wide')
                    }`}>
                      {messageText}
                    </p>
                  </div>
                  <span className="flex items-center text-xs font-black uppercase tracking-widest text-black whitespace-nowrap bg-yellow-400 border-2 border-black px-3 py-1.5 shrink-0 shadow-[2px_2px_0_0_#000]">
                    <Clock className="h-4 w-4 mr-2" /> 
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-yellow-400 border-4 border-black brutal-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 bg-white border-2 border-black p-1 hover:bg-gray-200 transition-colors brutal-shadow"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="p-8">
              <div className="inline-block bg-pink-500 text-white font-black uppercase tracking-widest px-3 py-1 text-xs border-2 border-black mb-4">
                Posted by Admin
              </div>
              <h2 className="text-4xl font-black text-black uppercase leading-none mb-6">
                {selectedAnnouncement.title}
              </h2>
              
              <div className="bg-white border-4 border-black p-6 mb-8 text-lg font-bold leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="flex items-center text-sm font-black uppercase tracking-widest text-black bg-white border-2 border-black px-4 py-2 brutal-shadow">
                  <Clock className="h-4 w-4 mr-2" /> 
                  {selectedAnnouncement.created_at ? formatDate(selectedAnnouncement.created_at) : 'Just Now'}
                </span>
                
                <button 
                  onClick={() => {
                    if (!selectedAnnouncement.is_read) {
                      markAsRead(selectedAnnouncement.notificationId);
                    }
                    setSelectedAnnouncement(null);
                  }}
                  className="bg-lime-400 text-black px-6 py-3 font-black uppercase tracking-widest border-3 border-black shadow-[4px_4px_0_0_#000] hover:bg-lime-300 hover:translate-x-1 transition-all flex items-center"
                >
                  <Check className="h-5 w-5 mr-2" /> Mark as Read & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
