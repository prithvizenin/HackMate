'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Bell, Search, Hexagon, Menu, X, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unreadCounts, setUnreadCounts] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifications = () => {
      if (user) {
        api.get('/api/notifications')
          .then(res => {
            const unread = res.data.filter((n: { is_read: boolean | number }) => !n.is_read).length;
            setUnreadCounts(unread);
          })
          .catch(err => console.error(err));
      }
    };

    fetchNotifications();

    window.addEventListener('notificationsUpdated', fetchNotifications);
    return () => window.removeEventListener('notificationsUpdated', fetchNotifications);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-cyan-400 border-b-4 border-black ${isScrolled ? 'shadow-[0_8px_0_0_rgba(0,0,0,1)]' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex flex-col group mt-[-8px]">
            <span className="text-2xl font-black tracking-tight uppercase bg-yellow-400 px-4 py-1.5 brutal-border brutal-shadow group-hover:bg-lime-400 -rotate-2 group-hover:rotate-0 transition-transform cursor-pointer flex items-center gap-2">
              <Hexagon className="h-6 w-6 fill-black" />
               Find My<br/>HackMate
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {!mounted ? (
              <div className="h-10 w-48 opacity-0"></div>
            ) : user ? (
              <div className="flex items-center space-x-5">
                <Link href="/browse" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 flex items-center gap-2 transition-all">
                  <Search className="h-6 w-6" /> Browse
                </Link>
                <Link href="/hackathons" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 transition-all">
                  Hackathons
                </Link>
                <Link href="/requests" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 transition-all">
                  Requests
                </Link>
                <Link href="/connections" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 transition-all">
                  My Squad
                </Link>
                <Link href="/teams" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 transition-all">
                  Teams
                </Link>
                <Link href="/messages" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 transition-all">
                  Chats
                </Link>
                
                <Link href="/notifications" className="relative p-2.5 bg-pink-400 brutal-border hover:bg-pink-300 transition-colors brutal-shadow-hover group">
                  <Bell className="h-6 w-6 text-black group-hover:animate-wiggle" />
                  {unreadCounts > 0 && (
                    <span className="absolute -top-3 -right-3 h-7 w-7 bg-yellow-400 brutal-border flex items-center justify-center rounded-full text-sm font-black text-black">
                      {unreadCounts}
                    </span>
                  )}
                </Link>

                <div className="h-8 w-1 bg-black mx-1 opacity-20"></div>

                <Link href="/profile/me" className="flex items-center space-x-2 bg-white brutal-border px-4 py-2 hover:bg-lime-400 transition-colors brutal-shadow-hover">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'guest')}`} alt={user?.name || 'User'} />
                    <AvatarFallback className="text-xs">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-black uppercase tracking-wide">
                    {user?.name ? user.name.split(' ')[0] : 'Explorer'}
                  </span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-white brutal-border hover:bg-red-400 transition-colors brutal-shadow-hover text-black"
                  title="Logout"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link href="/browse" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 flex items-center gap-2 transition-all mr-4">
                  <Search className="h-6 w-6" /> Browse Hackers
                </Link>
                <Link href="/hackathons" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 transition-all mr-4">
                  Hackathons
                </Link>
                <Link href="/login" className="font-bold text-black uppercase hover:underline decoration-4 decoration-white underline-offset-4 transition-all text-xl">
                  Log in
                </Link>
                <Link href="/register" className="bg-lime-400 text-black px-8 py-3 brutal-btn text-xl">
                  Sign Up 🚀
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white brutal-border text-black transition-colors hover:bg-lime-400"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b-4 border-black px-4 pt-2 pb-6 flex flex-col space-y-4 shadow-[0_8px_0_0_rgba(0,0,0,1)]">
          {!mounted ? null : user ? (
            <>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/browse" className="text-black font-extrabold uppercase hover:underline flex items-center gap-2">
                <Search className="h-5 w-5" /> Browse
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/hackathons" className="text-black font-extrabold uppercase hover:underline">Hackathons</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/requests" className="text-black font-extrabold uppercase hover:underline">Requests</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/connections" className="text-black font-extrabold uppercase hover:underline">My Squad</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/teams" className="text-black font-extrabold uppercase hover:underline">Teams</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/messages" className="text-black font-extrabold uppercase hover:underline flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Chats
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/notifications" className="text-black font-extrabold uppercase hover:underline flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifications {unreadCounts > 0 && `(${unreadCounts})`}
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/profile/me" className="text-black font-extrabold uppercase hover:underline flex items-center gap-2">
                <User className="h-5 w-5" /> Profile
              </Link>
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="text-red-600 font-extrabold uppercase hover:underline text-left flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/browse" className="text-black font-extrabold uppercase flex items-center gap-2">
                <Search className="h-5 w-5" /> Browse Hackers
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/hackathons" className="text-black font-extrabold uppercase">Hackathons</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/login" className="text-black font-extrabold uppercase">Log in</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/register" className="bg-lime-400 text-black px-4 py-3 brutal-border font-extrabold uppercase inline-block text-center mt-2">Sign Up 🚀</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
