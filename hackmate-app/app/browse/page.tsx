'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import UserCard from '@/components/UserCard';
import { Search, Filter, Loader2, UserMinus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Browse() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '', skill: '' });
  
  const { user: currentUser, loading: authLoading } = useAuth(); // rename to avoid conflict
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.skill) params.append('skill', filters.skill);

      const res = await api.get(`/api/users?${params.toString()}`);
      
      // Filter out self
      const otherUsers = res.data.filter((u: any) => u.id !== currentUser?.id);
      setUsers(otherUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentUser]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
      return;
    }
    
    // Check if profile is complete
    if (!authLoading && currentUser && (!currentUser.college || !currentUser.role)) {
      router.push('/profile/setup');
      return;
    }
    // Debounce basic implementation for search
    const delayDebounceFn = setTimeout(() => {
      if (currentUser) fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentUser, authLoading, router, fetchUsers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-10 w-32 h-32 bg-lime-400 brutal-border brutal-shadow animate-float rotate-6 hidden md:block" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400 brutal-border brutal-shadow animate-float hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10 animate-fade-in-up">
        <div>
          <div className="inline-block bg-yellow-400 border-3 border-black brutal-shadow px-4 py-1 mb-4 -rotate-2">
            <span className="font-extrabold text-black uppercase tracking-widest text-sm">Find Your Squad</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tight uppercase drop-shadow-[4px_4px_0_#fff]">
            Hacker <span className="text-cyan-500 stroke-black drop-shadow-[4px_4px_0_#000]">Directory</span>
          </h1>
        </div>
        
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white brutal-card p-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative grow sm:grow-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-black" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search hackers..."
              value={filters.search}
              onChange={handleFilterChange}
              className="block w-full sm:w-56 border-3 border-black py-2 pl-10 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all placeholder:text-gray-500 font-bold"
            />
          </div>
          
          <div className="relative">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="block w-full border-3 border-black py-2 pl-3 pr-8 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-cyan-100 focus:outline-none transition-all font-bold uppercase appearance-none"
            >
              <option value="">All Roles</option>
              <option value="Frontend Dev">Frontend Dev</option>
              <option value="Backend Dev">Backend Dev</option>
              <option value="Full Stack Dev">Full Stack Dev</option>
              <option value="Mobile Dev">Mobile Dev</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Data Scientist">Data Scientist</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <div className="relative grow sm:grow-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-black" />
            </div>
            <input
              type="text"
              name="skill"
              placeholder="Filter by skill..."
              value={filters.skill}
              onChange={handleFilterChange}
              className="block w-full sm:w-48 border-3 border-black py-2 pl-10 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-pink-100 focus:outline-none transition-all placeholder:text-gray-500 font-bold"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-4">
        {authLoading || (loading && users.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-24 text-black animate-fade-in">
            <Loader2 className="h-16 w-16 animate-spin mb-4" />
            <p className="text-black font-black uppercase text-xl tracking-widest">Finding Hackers...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white border-4 border-black brutal-shadow rounded-none p-16 mt-8 animate-fade-in-up">
            <div className="bg-red-400 p-6 border-4 border-black brutal-shadow mb-6 text-black rotate-[-5deg]">
              <UserMinus className="h-16 w-16" />
            </div>
            <h3 className="text-4xl font-black text-black uppercase mb-4 text-center">Ghost Town!</h3>
            <p className="mt-2 text-xl text-black font-bold max-w-md text-center">Try adjusting your filters or search terms to find the right people for your team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {users.map((user, i) => (
              <div key={user.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 0.1}s` }}>
                <UserCard user={user} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
