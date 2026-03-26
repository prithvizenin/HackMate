'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Bell, Search, Hexagon } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unreadCounts, setUnreadCounts] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/api/notifications')
        .then(res => {
          const unread = res.data.filter((n: { is_read: boolean }) => !n.is_read).length;
          setUnreadCounts(unread);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
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
            
            {user ? (
              <div className="flex items-center space-x-5">
                <Link href="/browse" className="text-black font-extrabold uppercase hover:underline decoration-4 decoration-pink-500 underline-offset-4 flex items-center gap-2 transition-all">
                  <Search className="h-6 w-6" /> Browse
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
                  <User className="h-5 w-5 font-bold" />
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
                <Link href="/login" className="font-bold text-black uppercase hover:underline decoration-4 decoration-white underline-offset-4 transition-all text-xl">
                  Log in
                </Link>
                <Link href="/register" className="bg-lime-400 text-black px-8 py-3 brutal-btn text-xl">
                  Sign Up 🚀
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
