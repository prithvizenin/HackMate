'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, GraduationCap, Briefcase, Calendar, Phone, Mail, Award, Edit, Loader2 } from 'lucide-react';
import SkillBadge from '@/components/SkillBadge';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const res = await api.get(`/api/profile/${user.id}`);
          setProfile(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user, authLoading, router]);

  if (authLoading || (loading && !profile)) return (
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
  if (!profile) return <div className="text-center p-12 text-black bg-red-400 font-black uppercase tracking-widest text-2xl brutal-shadow border-4 border-black max-w-lg mx-auto mt-10">Failed to load profile</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-pink-400 brutal-border brutal-shadow animate-float rotate-6 hidden md:block" />
      <div className="absolute top-40 -left-10 w-32 h-32 bg-lime-400 brutal-border brutal-shadow animate-float hidden md:block" style={{ animationDelay: '2s' }} />

      {/* Header Card */}
      <div className="brutal-card bg-white mb-8 relative z-10 animate-fade-in-up border-b-8 border-black">
        <div className="absolute top-4 right-4 z-10">
          <Link href="/profile/setup" className="bg-yellow-400 text-black text-sm font-black px-4 py-2 flex items-center transition-all brutal-btn tracking-widest">
            <Edit className="h-4 w-4 mr-2" /> EDIT
          </Link>
        </div>
        <div className="h-40 bg-cyan-400 border-b-4 border-black relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply opacity-80"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="h-32 w-32 bg-lime-400 border-4 border-black brutal-shadow flex items-center justify-center text-black rotate-[-3deg]">
              <User className="h-16 w-16" />
            </div>
            <div className="mt-16 sm:mt-0 bg-white p-2 px-4 border-4 border-black brutal-shadow rotate-1">
              <h1 className="text-4xl font-black text-black tracking-tight uppercase">{profile.name} <span className="text-sm font-bold text-gray-400 ml-2">(You)</span></h1>
              <p className="text-xl font-bold text-black flex items-center mt-1 uppercase tracking-wider">
                <Briefcase className="h-6 w-6 mr-2 text-pink-500" /> {profile.role}
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-8 py-5 border-t-4 border-black bg-pink-400 flex flex-wrap gap-y-4 gap-x-8 text-sm text-black font-black uppercase tracking-wider">
          <span className="flex items-center bg-white border-2 border-black px-2 py-1"><GraduationCap className="h-5 w-5 mr-2 text-black" /> {profile.college}</span>
          <span className="flex items-center bg-white border-2 border-black px-2 py-1"><Calendar className="h-5 w-5 mr-2 text-black" /> {profile.year}</span>
          <span className="flex items-center bg-white border-2 border-black px-2 py-1"><Mail className="h-5 w-5 mr-2 text-black" /> {profile.email}</span>
          {profile.contact && <span className="flex items-center bg-white border-2 border-black px-2 py-1"><Phone className="h-5 w-5 mr-2 text-black" /> {profile.contact}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="md:col-span-2 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <section className="brutal-card p-8 bg-yellow-400">
            <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-widest border-b-4 border-black pb-2 inline-block">
              About Me
            </h2>
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
              <p className="text-black font-bold bg-white p-4 border-4 border-black brutal-shadow">No achievements listed. <Link href="/profile/setup" className="text-pink-600 hover:text-pink-500 hover:underline decoration-4 underline-offset-4 transition-colors">Add some!</Link></p>
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
              <p className="text-black font-bold bg-white p-4 border-4 border-black brutal-shadow">No skills listed. <Link href="/profile/setup" className="text-pink-600 hover:text-pink-500 hover:underline decoration-4 underline-offset-4 transition-colors">Add some!</Link></p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
