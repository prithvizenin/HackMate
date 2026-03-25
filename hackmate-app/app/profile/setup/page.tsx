'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, GraduationCap, Phone, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    college: '',
    year: 'Freshman',
    role: 'Frontend Dev',
    bio: '',
    contact: ''
  });

  const [skills, setSkills] = useState<{id?: number, skill_name: string, proficiency: string}[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState('Beginner');

  const [achievements, setAchievements] = useState<{id?: number, title: string, description: string}[]>([]);
  const [newAchievementTitle, setNewAchievementTitle] = useState('');
  const [newAchievementDesc, setNewAchievementDesc] = useState('');

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get(`/api/profile/${user.id}`);
        const data = res.data;
        setFormData({
          name: data.name || '',
          college: data.college || '',
          year: data.year || 'Freshman',
          role: data.role || 'Frontend Dev',
          bio: data.bio || '',
          contact: data.contact || ''
        });
        setSkills(data.skills || []);
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error('Failed to fetch profile details', err);
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addSkill = (e: any) => {
    e.preventDefault();
    if (!newSkill) return;
    setSkills([...skills, { skill_name: newSkill, proficiency: newProficiency }]);
    setNewSkill('');
    setNewProficiency('Beginner');
  };

  const removeSkill = async (index: number) => {
    const skill = skills[index];
    if (skill.id) {
      try {
        await api.delete(`/api/profile/skills/${skill.id}`);
      } catch (err) {
        console.error('Failed to delete skill', err);
        alert('Failed to delete skill from server');
        return;
      }
    }
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addAchievement = (e: any) => {
    e.preventDefault();
    if (!newAchievementTitle) return;
    setAchievements([...achievements, { title: newAchievementTitle, description: newAchievementDesc }]);
    setNewAchievementTitle('');
    setNewAchievementDesc('');
  };

  const removeAchievement = async (index: number) => {
    const ach = achievements[index];
    if (ach.id) {
      try {
        await api.delete(`/api/profile/achievements/${ach.id}`);
      } catch (err) {
        console.error('Failed to delete achievement', err);
        alert('Failed to delete achievement from server');
        return;
      }
    }
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    try {
      await api.put('/api/profile', formData);
      
      // Only post new items (those without an id)
      const newSkills = skills.filter(s => !s.id);
      for (const skill of newSkills) {
        await api.post('/api/profile/skills', skill);
      }

      const newAch = achievements.filter(a => !a.id);
      for (const ach of newAch) {
        await api.post('/api/profile/achievements', ach);
      }

      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      localStorage.setItem('hackmate_user', JSON.stringify(updatedUser));

      setTimeout(() => {
        router.push('/browse');
      }, 300);
    } catch (err: any) {
      setError('Failed to setup profile: ' + (err.response?.data?.error || err.message));
      setSaveLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center p-24 text-black animate-fade-in min-h-[calc(100vh-80px)]">
      <Loader2 className="h-16 w-16 animate-spin mb-4" />
      <p className="text-black font-black uppercase text-xl tracking-widest">Retrieving Your Data...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-20 right-0 w-48 h-48 bg-cyan-400 brutal-border brutal-shadow animate-float hidden md:block" />
      <div className="absolute bottom-20 left-0 w-40 h-40 bg-pink-400 brutal-border brutal-shadow animate-float rotate-12 hidden md:block" style={{ animationDelay: '2s' }} />

      <div className="brutal-card bg-white p-10 relative z-10 animate-fade-in-up">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-400 border-4 border-black brutal-shadow mb-6 text-black rotate-[-3deg]">
            <UserIcon className="h-10 w-10" />
          </div>
          <h2 className="text-5xl font-black text-black tracking-tight uppercase">Update Profile</h2>
          <p className="mt-4 text-xl text-black font-bold">Add details to help others find you for their dream team.</p>
        </div>
        
        {error && <div className="mb-6 bg-red-400 text-black border-4 border-black brutal-shadow p-4 text-sm font-bold flex items-start animate-fade-in">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Basic Info Section */}
          <section className="space-y-6">
            <h3 className="text-3xl font-black text-black border-b-4 border-black pb-3 uppercase tracking-widest inline-block bg-lime-400 px-4 pt-2 -rotate-1">Target Identity</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
              <div>
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-black" />
                  </div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="block w-full border-3 border-black py-3 pl-11 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all font-bold" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Contact Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-black" />
                  </div>
                  <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="Discord / LinkedIn" required className="block w-full border-3 border-black py-3 pl-11 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">College</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-black" />
                  </div>
                  <input type="text" name="college" value={formData.college} onChange={handleChange} required className="block w-full border-3 border-black py-3 pl-11 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Year</label>
                <select name="year" value={formData.year} onChange={handleChange} className="block w-full border-3 border-black py-3 pl-4 pr-8 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all font-bold appearance-none">
                  <option>Freshman</option>
                  <option>Sophomore</option>
                  <option>Junior</option>
                  <option>Senior</option>
                  <option>Graduate</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Primary Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-black" />
                  </div>
                  <select name="role" value={formData.role} onChange={handleChange} className="block w-full border-3 border-black py-3 pl-11 pr-8 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all font-bold appearance-none">
                    <option>Frontend Dev</option>
                    <option>Backend Dev</option>
                    <option>Full Stack Dev</option>
                    <option>Mobile Dev</option>
                    <option>UI/UX Designer</option>
                    <option>Data Scientist</option>
                    <option>Product Manager</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Bio</label>
                <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="block w-full border-3 border-black py-3 pl-4 text-black bg-white shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] focus:bg-yellow-100 focus:outline-none transition-all font-bold placeholder:text-gray-500" placeholder="Tell everyone what you love building..."></textarea>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="space-y-6">
            <h3 className="text-3xl font-black text-black border-b-4 border-black pb-3 uppercase tracking-widest inline-block bg-pink-400 px-4 pt-2 -rotate-1">Arsenal</h3>
            
            <div className="flex gap-4 items-end flex-wrap sm:flex-nowrap bg-gray-100 p-6 border-4 border-black brutal-shadow mt-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Skill (e.g. Next.js)</label>
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="block w-full border-3 border-black py-2.5 px-4 text-black bg-white focus:bg-pink-100 focus:outline-none transition-all font-bold" />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Level</label>
                <select value={newProficiency} onChange={(e) => setNewProficiency(e.target.value)} className="block w-full border-3 border-black py-2.5 px-4 text-black bg-white focus:bg-pink-100 focus:outline-none transition-all font-bold appearance-none">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <button type="button" onClick={addSkill} className="w-full sm:w-auto bg-cyan-400 text-black px-6 py-3 font-black uppercase tracking-widest hover:bg-cyan-300 transition-all border-3 border-black hover:translate-x-1 mt-4 sm:mt-0 shadow-[4px_4px_0_0_#000]">ADD IT</button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6 p-6 border-4 border-black border-dashed">
                {skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center bg-yellow-400 border-2 border-black brutal-shadow px-4 py-2 text-sm font-black text-black uppercase tracking-wider animate-fade-in">
                    {skill.skill_name} <span className="ml-2 px-2 py-1 bg-white border border-black text-xs">{skill.proficiency}</span>
                    <button type="button" onClick={() => removeSkill(index)} className="group relative ml-3 h-6 w-6 border-2 border-black bg-red-400 hover:bg-red-500 transition-colors flex items-center justify-center">
                      <span className="sr-only">Remove</span>
                      <svg viewBox="0 0 14 14" className="h-4 w-4 stroke-black group-hover:stroke-black">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4l6 6m0-6l-6 6" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Achievements Section */}
          <section className="space-y-6">
            <h3 className="text-3xl font-black text-black border-b-4 border-black pb-3 uppercase tracking-widest inline-block bg-cyan-400 px-4 pt-2 -rotate-1">Trophies</h3>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 items-start bg-gray-100 p-6 border-4 border-black brutal-shadow mt-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Title</label>
                <input type="text" value={newAchievementTitle} onChange={(e) => setNewAchievementTitle(e.target.value)} className="block w-full border-3 border-black py-2.5 px-4 text-black bg-white focus:bg-cyan-100 focus:outline-none transition-all font-bold" placeholder="1st Place - Web3 Hackathon 2023" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5">Description</label>
                <textarea rows={3} value={newAchievementDesc} onChange={(e) => setNewAchievementDesc(e.target.value)} className="block w-full border-3 border-black py-2.5 px-4 text-black bg-white focus:bg-cyan-100 focus:outline-none transition-all font-bold placeholder:text-gray-500" placeholder="Built a awesome project..."></textarea>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="button" onClick={addAchievement} className="w-full sm:w-auto bg-lime-400 text-black px-6 py-3 font-black uppercase tracking-widest hover:bg-lime-300 transition-all border-3 border-black hover:translate-x-1 shadow-[4px_4px_0_0_#000]">ADD TROPHY</button>
              </div>
            </div>

            {achievements.length > 0 && (
              <ul className="mt-6 space-y-4">
                {achievements.map((ach, index) => (
                  <li key={index} className="flex flex-col sm:flex-row justify-between items-start bg-white p-6 border-4 border-black brutal-shadow animate-fade-in gap-4">
                    <div>
                      <h4 className="font-black text-black text-xl uppercase">{ach.title}</h4>
                      <p className="text-sm font-bold text-gray-800 mt-2 leading-relaxed bg-gray-100 border border-black p-3 inline-block">{ach.description}</p>
                    </div>
                    <button type="button" onClick={() => removeAchievement(index)} className="bg-red-400 text-black border-3 border-black px-4 py-2 text-sm font-black uppercase tracking-wider hover:bg-red-500 hover:translate-x-1 shadow-[4px_4px_0_0_#000] whitespace-nowrap">REMOVE</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="pt-6 flex justify-end border-t-8 border-black mt-10 pt-10">
            <button
              type="submit"
              disabled={saveLoading}
              className="group relative flex w-full sm:w-auto justify-center items-center bg-indigo-500 px-8 py-4 text-xl text-black hover:bg-indigo-400 disabled:bg-gray-400 transition-all brutal-btn"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-white" />
                  <span className="text-white">SAVING...</span>
                </>
              ) : (
                <>
                  <span className="text-white">DEPLOY PROFILE</span>
                  <ArrowRight className="ml-3 h-6 w-6 text-white group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
