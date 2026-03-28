'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { User, GraduationCap, Briefcase, ChevronRight, UserPlus, CheckCircle, Loader2, Send } from 'lucide-react';
import SkillBadge from './SkillBadge';
import api from '@/lib/api';

const UserCard = memo(({ user: initialUser }: { user: any }) => {
  const [status, setStatus] = useState(initialUser.connectionStatus || 'none');
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('pending'); // Optimistic Update
    try {
      await api.post('/api/requests', { receiverId: initialUser.id });
    } catch (err) {
      console.error(err);
      setStatus('none'); // Rollback on error
      alert('Failed to send connection request');
    }
  };

  return (
    <div className="group bg-white brutal-card flex flex-col h-full hover:-translate-y-2 transition-transform duration-200">
      <div className="p-6 grow flex flex-col">
        <div className="flex items-start space-x-4 mb-5">
          <div className="h-16 w-16 bg-lime-400 brutal-border brutal-shadow flex items-center justify-center text-black shrink-0 group-hover:rotate-6 transition-transform duration-200">
            <User className="h-8 w-8" />
          </div>
          <div className="space-y-1 grow">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-black text-black uppercase tracking-wide group-hover:underline decoration-4 decoration-pink-500 underline-offset-4 transition-all line-clamp-1">
                {initialUser.name}
              </h3>
            </div>
            <div className="flex items-center text-sm text-black font-bold">
              <GraduationCap className="h-4 w-4 mr-1.5 shrink-0" />
              <span className="line-clamp-1">{initialUser.college} ({initialUser.year})</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="inline-flex items-center text-sm font-black text-black bg-cyan-400 px-3 py-1.5 border-3 border-black brutal-shadow-sm uppercase tracking-wider">
            <Briefcase className="h-4 w-4 mr-2" />
            {initialUser.role}
          </div>
        </div>

        <div className="mt-auto mb-6">
          {initialUser.skills && initialUser.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {initialUser.skills.slice(0, 3).map((skill: any, index: number) => (
                <SkillBadge key={index} skill_name={skill.skill_name} proficiency={skill.proficiency} />
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-500 uppercase font-black">Ready to build</p>
          )}
        </div>

        <div className="pt-4 border-t-2 border-dashed border-black">
          {status === 'connected' ? (
            <Link 
              href={`/profile/${initialUser.id}`}
              className="w-full bg-yellow-400 border-3 border-black py-2 font-black text-black uppercase tracking-widest text-sm flex items-center justify-center hover:bg-yellow-300 transition-all shadow-[4px_4px_0_0_#000]"
            >
              <Send className="h-4 w-4 mr-2" /> Send Team Request
            </Link>
          ) : status === 'pending' ? (
            <button disabled className="w-full bg-gray-200 border-3 border-black py-2 font-black text-black uppercase tracking-widest text-sm flex items-center justify-center shadow-[2px_2px_0_0_#000]">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Request Sent
            </button>
          ) : status === 'incoming_pending' ? (
            <Link 
              href="/requests"
              className="w-full bg-pink-400 border-3 border-black py-2 font-black text-black uppercase tracking-widest text-sm flex items-center justify-center hover:bg-pink-300 transition-all shadow-[4px_4px_0_0_#000]"
            >
              Review Request
            </Link>
          ) : (
            <button 
              onClick={handleConnect}
              className="w-full bg-lime-400 border-3 border-black py-2 font-black text-black uppercase tracking-widest text-sm flex items-center justify-center hover:bg-lime-300 transition-all shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Connect
            </button>
          )}
        </div>
      </div>
      
      <div className="border-t-4 border-black bg-pink-400 p-0 hover:bg-pink-300 transition-colors">
        <Link 
          href={`/profile/${initialUser.id}`} 
          className="text-lg font-black text-black flex items-center justify-between w-full h-full px-6 py-4 uppercase tracking-wider"
        >
          Profile
          <ChevronRight className="h-6 w-6 transform group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </div>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;
