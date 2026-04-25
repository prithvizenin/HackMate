'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, ExternalLink, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function HackathonsPage() {
  const [devfolioHackathons, setDevfolioHackathons] = useState<any[]>([]);
  const [customHackathons, setCustomHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const customRes = await fetch('/api/admin/hackathons');
 
        if (customRes.ok) {
          const customData = await customRes.json();
          setCustomHackathons(customData || []);
        }
      } catch (err) {
        console.error('Error fetching hackathons:', err);
      } finally {
        setLoading(false);
      }
    };



    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 min-h-[60vh]">
        <Loader2 className="w-16 h-16 animate-spin text-black" />
      </div>
    );
  }

  // Sort custom hackathons by date (closest first)
  const sortedCustom = [...customHackathons].sort((a, b) => {
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase text-black mb-4 tracking-tight bg-lime-400 inline-block px-4 py-2 border-4 border-black shadow-[8px_8px_0_0_#000] -rotate-1">
            Hackathons
          </h1>
          <p className="text-xl md:text-2xl font-bold max-w-2xl mt-6 border-l-8 border-pink-500 pl-6 py-2 bg-white brut-shadow border-4 border-black">
            Discover upcoming hacking events, form your squad, and build the future. 🚀
          </p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Custom Hackathons Column */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black uppercase mb-8 flex items-center bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">
              <Code2 className="mr-3 h-8 w-8 text-pink-500" /> Platform Events
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sortedCustom.length === 0 ? (
                <p className="text-xl font-bold text-gray-600 bg-white p-6 border-4 border-black border-dashed col-span-full text-center">
                  No platform events scheduled right now. Check back soon!
                </p>
              ) : (
                sortedCustom.map(hack => (
                  <div key={hack.id} className="bg-white border-4 border-black shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] transition-all hover:-translate-y-1">
                    <div className="p-6">
                      <h3 className="text-3xl font-black uppercase mb-3 text-pink-500">{hack.title}</h3>
                      <p className="font-bold text-lg mb-4 line-clamp-3">{hack.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm font-black uppercase bg-gray-100 p-3 border-2 border-black inline-flex">
                        {hack.start_date && (
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2"/> 
                            {new Date(hack.start_date).toLocaleDateString()}
                          </span>
                        )}
                        {hack.end_date && hack.end_date !== hack.start_date && (
                          <span className="flex items-center border-l-2 border-gray-400 pl-4">
                            {new Date(hack.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="border-t-4 border-black p-4 bg-yellow-400 flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-black">HackMate Official</span>
                      <Link href={`/teams`} className="brutal-btn bg-black text-white px-6 py-2">
                        Join Team
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );

}
