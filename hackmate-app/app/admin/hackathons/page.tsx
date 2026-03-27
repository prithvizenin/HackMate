'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Loader2, Calendar } from 'lucide-react';

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [expandedHackathon, setExpandedHackathon] = useState<number | null>(null);
  const [teamsData, setTeamsData] = useState<Record<number, any[]>>({});

  const fetchHackathons = async () => {
    try {
      const res = await fetch('/api/admin/hackathons');
      const data = await res.json();
      setHackathons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const createHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    await fetch('/api/admin/hackathons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, start_date: startDate || null, end_date: endDate || null }),
    });
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    fetchHackathons();
  };

  const loadTeams = async (hackathonId: number) => {
    if (expandedHackathon === hackathonId) {
      setExpandedHackathon(null);
      return;
    }
    setExpandedHackathon(hackathonId);
    if (!teamsData[hackathonId]) {
      try {
        const res = await fetch(`/api/admin/hackathons/${hackathonId}/teams`);
        const data = await res.json();
        setTeamsData(prev => ({ ...prev, [hackathonId]: data }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading && hackathons.length === 0) return <div className="flex items-center justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-black" /></div>;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-5xl font-black uppercase text-black mb-10 tracking-tight bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">Hackathons</h1>
      
      <div className="bg-white border-4 border-black p-8 mb-12 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center"><Plus className="mr-2 h-6 w-6" /> Add New Hackathon</h2>
        <form onSubmit={createHackathon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
            </div>
            <div>
              <label className="block font-black uppercase mb-1">Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
            </div>
            <div>
              <label className="block font-black uppercase mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
            </div>
            <div>
              <label className="block font-black uppercase mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="brutal-btn bg-lime-400 py-3 px-8 text-xl mt-4 disabled:opacity-50">Create Hackathon</button>
        </form>
      </div>

      <div className="space-y-6">
        {hackathons.map(hack => (
          <div key={hack.id} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000]">
            <div className="p-6 flex flex-col md:flex-row justify-between md:items-center bg-yellow-400">
              <div>
                <h3 className="text-2xl font-black uppercase">{hack.title}</h3>
                {hack.description && <p className="font-bold text-gray-800 mt-1">{hack.description}</p>}
                <div className="flex gap-4 mt-2 text-sm font-black uppercase">
                  {hack.start_date && <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Start: {new Date(hack.start_date).toLocaleDateString()}</span>}
                  {hack.end_date && <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> End: {new Date(hack.end_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <button 
                onClick={() => loadTeams(hack.id)}
                className="mt-4 md:mt-0 flex items-center justify-center bg-black text-white px-4 py-2 font-black uppercase hover:bg-gray-800 transition-colors border-2 border-black shadow-[2px_2px_0_0_#FFF]"
              >
                <Users className="w-5 h-5 mr-2" /> 
                {expandedHackathon === hack.id ? 'Hide Teams' : 'View Teams'}
              </button>
            </div>
            
            {expandedHackathon === hack.id && (
              <div className="p-6 border-t-4 border-black bg-gray-50">
                <h4 className="font-black uppercase text-lg mb-4">Registered Teams</h4>
                {!teamsData[hack.id] ? (
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                ) : teamsData[hack.id].length === 0 ? (
                  <p className="font-bold text-gray-600">No teams registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamsData[hack.id].map((team: any) => (
                      <div key={team.id} className="bg-white border-4 border-black p-4 shadow-[2px_2px_0_0_#000]">
                        <h5 className="font-black uppercase text-xl mb-2 text-pink-500">{team.name}</h5>
                        <ul className="space-y-2">
                          {team.members.map((m: any) => (
                            <li key={m.id} className="flex justify-between items-center text-sm font-bold border-b-2 border-gray-100 pb-1">
                              <span>{m.user ? `${m.user.name} (${m.user.email})` : 'Unknown User'}</span>
                              <span className={`uppercase text-xs px-2 py-0.5 border-2 border-black ${m.role === 'leader' ? 'bg-cyan-400' : 'bg-lime-400'}`}>
                                {m.role}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
