'use client';

import { useState } from 'react';
import { Plus, Users, Loader2, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

const hackathonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
});
type HackathonFormValues = z.infer<typeof hackathonSchema>;

export default function AdminHackathons() {
  const queryClient = useQueryClient();
  const [expandedHackathon, setExpandedHackathon] = useState<number | null>(null);

  const { data: hackathons = [], isLoading: hackathonsLoading } = useQuery({
    queryKey: ['admin_hackathons'],
    queryFn: async () => {
      const res = await fetch('/api/admin/hackathons');
      if (!res.ok) throw new Error('Failed to fetch hackathons');
      return res.json();
    }
  });

  const { data: teamsData = {}, isLoading: teamsLoading } = useQuery({
    queryKey: ['admin_hackathons_teams', expandedHackathon],
    queryFn: async () => {
      if (!expandedHackathon) return {};
      const res = await fetch(`/api/admin/hackathons/${expandedHackathon}/teams`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      return { [expandedHackathon]: data };
    },
    enabled: !!expandedHackathon,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HackathonFormValues>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
       title: '',
       description: '',
       startDate: '',
       endDate: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: HackathonFormValues) => {
      const res = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: data.title, 
          description: data.description, 
          start_date: data.startDate || null, 
          end_date: data.endDate || null 
        }),
      });
      if (!res.ok) throw new Error('Failed to create hackathon');
      return res.json();
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin_hackathons'] });
    },
    onError: () => alert('Failed to create hackathon')
  });

  const loadTeams = (hackathonId: number) => {
    if (expandedHackathon === hackathonId) {
      setExpandedHackathon(null);
    } else {
      setExpandedHackathon(hackathonId);
    }
  };

  if (hackathonsLoading && hackathons.length === 0) return <div className="flex items-center justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-black" /></div>;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-5xl font-black uppercase text-black mb-10 tracking-tight bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">Hackathons</h1>
      
      <div className="bg-white border-4 border-black p-8 mb-12 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center"><Plus className="mr-2 h-6 w-6" /> Add New Hackathon</h2>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase mb-1">Title</label>
              <input type="text" {...register("title")} className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
              {errors.title && <p className="text-red-500 font-bold text-sm mt-1 uppercase">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block font-black uppercase mb-1">Description</label>
              <input type="text" {...register("description")} className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
            </div>
            <div>
              <label className="block font-black uppercase mb-1">Start Date</label>
              <input type="date" {...register("startDate")} className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
            </div>
            <div>
              <label className="block font-black uppercase mb-1">End Date</label>
              <input type="date" {...register("endDate")} className="w-full border-4 border-black p-2 focus:bg-yellow-100 outline-none transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="brutal-btn bg-lime-400 py-3 px-8 text-xl mt-4 disabled:opacity-50 flex items-center gap-2">
            {createMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {createMutation.isPending ? 'CREATING...' : 'CREATE HACKATHON'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {hackathons.map((hack: any) => (
          <div key={hack.id} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000]">
            <div className="p-6 flex flex-col md:flex-row justify-between md:items-center bg-yellow-400">
              <div>
                <h3 className="text-2xl font-black uppercase">{hack.title}</h3>
                {hack.description && <p className="font-bold text-gray-800 mt-1">{hack.description}</p>}
                <div className="flex gap-4 mt-2 text-sm font-black uppercase">
                  {hack.start_date && <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Start: {format(new Date(hack.start_date), 'PPP')}</span>}
                  {hack.end_date && <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> End: {format(new Date(hack.end_date), 'PPP')}</span>}
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
                {teamsLoading && !teamsData[hack.id] ? (
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                ) : !teamsData[hack.id] || teamsData[hack.id].length === 0 ? (
                  <p className="font-bold text-gray-600">No teams registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamsData[hack.id].map((team: any) => (
                      <div key={team.id} className="bg-white border-4 border-black p-4 shadow-[2px_2px_0_0_#000]">
                        <h5 className="font-black uppercase text-xl mb-2 text-pink-500">{team.name}</h5>
                        <ul className="space-y-2">
                          {team.members?.map((m: any) => (
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
