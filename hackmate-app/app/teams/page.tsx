'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Plus, UserPlus, LogOut, Loader2, Crown, Check, X, Shield, Search, Bell } from 'lucide-react';

export default function TeamsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, connRes] = await Promise.all([
        api.get('/api/teams'),
        api.get('/api/connections')
      ]);
      
      // Fetch details for each team to get members
      const teamsWithDetails = await Promise.all(
        teamsRes.data.map(async (t: any) => {
          try {
            const detailRes = await api.get(`/api/teams/${t.id}`);
            return { 
              ...detailRes.data, 
              membership_status: t.membership_status, 
              role: t.role 
            };
          } catch (e) {
            return { ...t, members: [] };
          }
        })
      );
      
      setTeams(teamsWithDetails);
      setConnections(connRes.data);
    } catch (err) {
      console.error('Failed to fetch teams data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreateLoading(true);
    try {
      await api.post('/api/teams', { name: newTeamName });
      setNewTeamName('');
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create team');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: number) => {
    try {
      await api.post(`/api/teams/${teamId}/join`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to join team');
    }
  };

  const handleLeaveTeam = async (teamId: number) => {
    if (!confirm('Are you sure you want to leave this team?')) return;
    try {
      await api.post(`/api/teams/${teamId}/leave`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to leave team');
    }
  };

  const handleInvite = async (userId: number) => {
    try {
      await api.post(`/api/teams/${selectedTeam.id}/invite`, { userId });
      alert('Invitation sent!');
      setShowInviteModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send invitation');
    }
  };

  if (authLoading || loading) return (
    <div className="flex flex-col items-center justify-center p-24 text-black animate-fade-in min-h-[calc(100vh-80px)]">
      <Loader2 className="h-16 w-16 animate-spin mb-4" />
      <p className="text-black font-black uppercase text-xl tracking-widest">Loading Your Squads...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-10 w-32 h-32 bg-yellow-400 brutal-border brutal-shadow animate-float rotate-6 hidden md:block" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400 brutal-border brutal-shadow animate-get-sucked hidden md:block" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10 animate-fade-in-up">
        <div>
          <div className="inline-block bg-lime-400 border-3 border-black brutal-shadow px-4 py-1 mb-4 -rotate-2">
            <span className="font-extrabold text-black uppercase tracking-widest text-sm">Squad Goals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tight uppercase drop-shadow-[4px_4px_0_#fff]">
            Your <span className="text-pink-500 stroke-black drop-shadow-[4px_4px_0_#000]">Teams</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-8 py-4 brutal-btn text-xl font-black uppercase hover:bg-indigo-400"
        >
          <Plus className="h-6 w-6" /> Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {/* Active Teams */}
        <div className="bg-white brutal-card p-8 animate-fade-in-up">
          <h2 className="text-3xl font-black text-black uppercase mb-8 border-b-4 border-black pb-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-500" /> Joined Teams
          </h2>
          
          <div className="space-y-6">
            {teams.filter(t => t.membership_status === 'joined').length === 0 ? (
              <p className="text-gray-500 font-bold italic py-10 text-center uppercase tracking-widest">You haven&apos;t joined any teams yet.</p>
            ) : (
              teams.filter(t => t.membership_status === 'joined').map((team) => (
                <div key={team.id} className="bg-yellow-100 brutal-border p-6 relative group transition-transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-black uppercase">{team.name}</h3>
                      <p className="text-sm font-bold text-gray-600">Established {new Date(team.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-black uppercase mb-3 text-gray-500">Squad Members</p>
                    <div className="flex flex-wrap gap-3">
                      {team.members?.map((member: any) => (
                        <div key={member.id} className="relative group/member">
                          <div className={`h-12 w-12 border-2 border-black flex items-center justify-center font-black text-lg brutal-shadow-sm ${member.team_role === 'leader' ? 'bg-yellow-400' : 'bg-white'}`}>
                            {member.name[0]}
                          </div>
                          {member.team_role === 'leader' && (
                            <div className="absolute -top-4 -right-2 rotate-12 drop-shadow-[2px_2px_0_#000]">
                              <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                            </div>
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] px-2 py-1 opacity-0 group-hover/member:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                            {member.name} {member.status === 'pending' ? '(Invited)' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {team.role === 'leader' && (
                      <button 
                        onClick={() => { setSelectedTeam(team); setShowInviteModal(true); }}
                        className="flex-1 bg-cyan-400 border-3 border-black px-4 py-2 font-black uppercase text-sm brutal-shadow hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" /> Invite
                      </button>
                    )}
                    <button 
                      onClick={() => handleLeaveTeam(team.id)}
                      className="flex-1 bg-white border-3 border-black px-4 py-2 font-black uppercase text-sm brutal-shadow hover:bg-red-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" /> {team.role === 'leader' ? 'Dissolve' : 'Leave'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        
        <div className="bg-white brutal-card p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-black text-black uppercase mb-8 border-b-4 border-black pb-4 flex items-center gap-3">
            <Bell className="h-8 w-8 text-pink-500" /> Pending Invites
          </h2>
          
          <div className="space-y-6">
            {teams.filter(t => t.membership_status === 'pending').length === 0 ? (
              <p className="text-gray-500 font-bold italic py-10 text-center uppercase tracking-widest">No pending invitations.</p>
            ) : (
              teams.filter(t => t.membership_status === 'pending').map((team) => (
                <div key={team.id} className="bg-pink-100 brutal-border p-6 flex items-center justify-between animate-wiggle">
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">{team.name}</h3>
                    <p className="text-sm font-bold text-gray-700 uppercase">You&apos;ve been invited!</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleJoinTeam(team.id)}
                      className="bg-lime-400 border-3 border-black p-3 brutal-shadow hover:bg-lime-300"
                    >
                      <Check className="h-6 w-6 font-black" />
                    </button>
                    <button 
                      onClick={() => handleLeaveTeam(team.id)}
                      className="bg-white border-3 border-black p-3 brutal-shadow hover:bg-red-400"
                    >
                      <X className="h-6 w-6 font-black" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white brutal-border brutal-shadow-lg p-8 w-full max-w-md animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-black uppercase text-black">Form a Squad</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-black hover:rotate-90 transition-transform"><X className="h-8 w-8" /></button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-6">
                <label className="block text-xl font-black uppercase mb-2">Team Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full border-4 border-black p-4 text-xl font-bold brutal-shadow focus:bg-yellow-100 outline-none"
                  placeholder="E.g. Code Wizards"
                />
              </div>
              <button 
                type="submit" 
                disabled={createLoading}
                className="w-full bg-lime-400 border-4 border-black py-4 text-xl font-black uppercase brutal-shadow hover:bg-lime-300 disabled:opacity-50"
              >
                {createLoading ? 'Establishing...' : 'Deploy Team'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white brutal-border brutal-shadow-lg p-8 w-full max-w-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-3xl font-black uppercase text-black">Invite Hackers</h3>
                <p className="font-bold text-gray-600 uppercase">Adding members to {selectedTeam?.name}</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-black hover:rotate-90 transition-transform"><X className="h-8 w-8" /></button>
            </div>
            
            <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
              {connections.length === 0 ? (
                <div className="text-center py-10 bg-gray-100 border-3 border-black border-dashed">
                  <p className="font-black text-black uppercase italic">You have no connected hackers to invite.</p>
                  <button onClick={() => router.push('/browse')} className="mt-4 text-pink-600 font-bold hover:underline uppercase underline-offset-4">Go Browse Hackers →</button>
                </div>
              ) : (
                connections.map(conn => (
                  <div key={conn.id} className="bg-white brutal-border p-4 flex items-center justify-between border-3 border-black">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-pink-400 border-2 border-black flex items-center justify-center font-black">
                        {conn.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-black uppercase">{conn.name}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">{conn.role} @ {conn.college}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleInvite(conn.id)}
                      className="bg-cyan-400 border-3 border-black px-4 py-2 font-black uppercase text-sm brutal-shadow hover:bg-cyan-300"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
