'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, GraduationCap, Briefcase, Calendar, Phone, Mail, Award, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import SkillBadge from '@/components/SkillBadge';
import { useAuth } from '@/context/AuthContext';

export default function ProfileView() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [requestLoading, setRequestLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const profRes = await api.get(`/api/profile/${id}`);
        
        setProfile(profRes.data);
        setConnectionStatus(profRes.data.connectionStatus || 'none');
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user, authLoading, router]);

  const sendRequest = async () => {
    setRequestLoading(true);
    try {
      await api.post('/api/requests', { receiverId: id });
      setConnectionStatus('pending');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  };

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchMyTeams = async () => {
    try {
      const res = await api.get('/api/teams');
      // Only show teams where user is leader
      setMyTeams(res.data.filter((t: any) => t.role === 'leader'));
      setShowInviteModal(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch teams');
    }
  };

  const handleInvite = async (teamId: number) => {
    setInviteLoading(true);
    try {
      await api.post(`/api/teams/${teamId}/invite`, { userId: id });
      alert('Team invitation sent!');
      setShowInviteModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  if (authLoading || (loading && !error)) return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="brutal-card bg-gray-100 mb-8 w-full h-80 animate-pulse border-b-8 border-gray-300" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="brutal-card h-64 bg-gray-100 animate-pulse" />
          <div className="brutal-card h-80 bg-gray-100 animate-pulse" />
        </div>
        <div className="space-y-8">
          <div className="brutal-card h-96 bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
  if (error || !profile) return <div className="text-center p-12 text-black bg-red-400 font-black uppercase tracking-widest text-2xl brutal-shadow border-4 border-black max-w-lg mx-auto mt-10">{error || 'Profile not found'}</div>;

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-4 border-black brutal-shadow max-w-md w-full p-8 animate-fade-in-up">
            <h3 className="text-3xl font-black text-black uppercase mb-6 border-b-4 border-black pb-2">Invite to Team</h3>
            {myTeams.length === 0 ? (
              <p className="text-black font-bold mb-6">You don&apos;t lead any teams. Create one first!</p>
            ) : (
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {myTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleInvite(team.id)}
                    disabled={inviteLoading}
                    className="w-full text-left bg-yellow-100 hover:bg-yellow-200 border-3 border-black p-4 font-black uppercase tracking-tight transition-all flex justify-between items-center group"
                  >
                    {team.name}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full bg-red-400 text-black border-4 border-black py-3 font-black uppercase tracking-widest hover:bg-red-300 transition-all hover:translate-x-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-pink-400 brutal-border brutal-shadow animate-float rotate-12 hidden md:block" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-400 brutal-border brutal-shadow animate-float hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="brutal-card bg-white mb-8 relative z-10 animate-fade-in-up border-b-8 border-black">
        <div className="h-40 bg-cyan-400 border-b-4 border-black relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply opacity-80"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="h-32 w-32 bg-lime-400 border-4 border-black brutal-shadow flex items-center justify-center text-black rotate-[-3deg]">
              <User className="h-16 w-16" />
            </div>
            <div className="mt-16 sm:mt-0 bg-white p-2 px-4 border-4 border-black brutal-shadow rotate-1">
              <h1 className="text-4xl font-black text-black tracking-tight uppercase">{profile.name}</h1>
              <p className="text-xl font-bold text-black flex items-center mt-1 uppercase tracking-wider">
                <Briefcase className="h-6 w-6 mr-2 text-pink-500" /> {profile.role}
              </p>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex gap-3">
            {connectionStatus === 'connected' ? (
              <button 
                onClick={fetchMyTeams}
                className="bg-yellow-400 border-4 border-black brutal-shadow px-6 py-4 text-sm font-black text-black uppercase tracking-widest hover:bg-yellow-300 transition-all active:translate-y-1 brutal-btn flex items-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" /> Send Team Request
              </button>
            ) : connectionStatus === 'pending' ? (
              <span className="inline-flex items-center gap-x-1.5 bg-gray-200 border-4 border-black brutal-shadow px-5 py-3 text-sm font-black text-black uppercase tracking-widest">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Request Sent
              </span>
            ) : connectionStatus === 'incoming_pending' ? (
              <button onClick={() => router.push('/requests')} className="bg-pink-400 px-5 py-3 text-sm font-black text-black brutal-btn uppercase tracking-widest hover:bg-pink-300 transition-all border-4 border-black brutal-shadow flex items-center">
                Review Request
              </button>
            ) : (
              <button 
                onClick={sendRequest}
                disabled={requestLoading}
                className="bg-cyan-400 px-8 py-4 text-sm font-black text-black brutal-btn uppercase tracking-widest hover:bg-cyan-300 disabled:bg-gray-400 flex items-center border-4 border-black brutal-shadow transition-all shadow-[6px_6px_0_0_#000]"
              >
                {requestLoading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> SENDING...</> : 'Connect'}
              </button>
            )}
          </div>
        </div>
        
        <div className="px-8 py-5 border-t-4 border-black bg-pink-400 flex flex-wrap gap-y-4 gap-x-8 text-sm text-black font-black uppercase tracking-wider">
          <span className="flex items-center bg-white border-2 border-black px-2 py-1"><GraduationCap className="h-5 w-5 mr-2 text-black" /> {profile.college}</span>
          <span className="flex items-center bg-white border-2 border-black px-2 py-1"><Calendar className="h-5 w-5 mr-2 text-black" /> {profile.year}</span>
          {isConnected && (
            <>
              <span className="flex items-center bg-white border-2 border-black px-2 py-1"><Mail className="h-5 w-5 mr-2 text-black" /> {profile.email}</span>
              {profile.contact && <span className="flex items-center bg-white border-2 border-black px-2 py-1"><Phone className="h-5 w-5 mr-2 text-black" /> {profile.contact}</span>}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="md:col-span-2 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <section className="brutal-card p-8 bg-yellow-400">
            <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-widest border-b-4 border-black pb-2 inline-block">About Hacker</h2>
            <p className="text-black font-bold whitespace-pre-line leading-relaxed text-lg bg-white p-4 border-4 border-black brutal-shadow mt-4">
              {profile.bio || 'No bio provided.'}
            </p>
          </section>

          <section className="brutal-card p-8 bg-cyan-400">
            <h2 className="flex items-center text-2xl font-black text-black mb-6 uppercase tracking-widest border-b-4 border-black pb-2">
              <Award className="h-8 w-8 mr-2 text-black" />
              Achievements
            </h2>
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="space-y-6">
                {profile.achievements.map((ach: any) => (
                  <div key={ach.id} className="border-4 border-black brutal-shadow bg-white p-6 transition-all hover:-translate-y-1">
                    <h3 className="font-black text-black text-xl uppercase tracking-wide">{ach.title}</h3>
                    {ach.description && <p className="text-base text-gray-800 font-bold mt-2">{ach.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-black font-bold bg-white p-4 border-4 border-black brutal-shadow">No achievements listed.</p>
            )}
          </section>
        </div>

        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <section className="brutal-card p-8 bg-lime-400">
            <h2 className="text-2xl font-black text-black mb-6 uppercase tracking-widest border-b-4 border-black pb-2 inline-block">Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: any) => (
                  <SkillBadge key={skill.id} skill_name={skill.skill_name} proficiency={skill.proficiency} />
                ))}
              </div>
            ) : (
              <p className="text-black font-bold bg-white p-4 border-4 border-black brutal-shadow">No skills listed.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
