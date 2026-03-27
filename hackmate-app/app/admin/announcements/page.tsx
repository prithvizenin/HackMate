'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Loader2 } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setLoading(true);
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    setTitle('');
    setContent('');
    fetchAnnouncements();
  };

  if (loading && announcements.length === 0) return <div className="flex items-center justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-black" /></div>;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-5xl font-black uppercase text-black mb-10 tracking-tight bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">Announcements</h1>
      
      <div className="bg-white border-4 border-black p-8 mb-12 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center"><Megaphone className="mr-2 h-6 w-6" /> Publish Announcement</h2>
        <form onSubmit={createAnnouncement} className="space-y-4">
          <div>
            <label className="block font-black uppercase mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border-4 border-black p-3 text-lg font-bold focus:bg-cyan-100 outline-none transition-colors" />
          </div>
          <div>
            <label className="block font-black uppercase mb-1">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4} className="w-full border-4 border-black p-3 text-lg font-bold focus:bg-cyan-100 outline-none transition-colors resize-y" />
          </div>
          <button type="submit" disabled={loading} className="brutal-btn bg-cyan-400 py-3 px-8 text-xl mt-4 disabled:opacity-50">Publish Now</button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase mb-4">Past Announcements</h2>
        {announcements.map(ann => (
          <div key={ann.id} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6 relative">
            <div className="absolute top-0 right-0 bg-yellow-400 border-l-4 border-b-4 border-black px-3 py-1 font-black uppercase text-xs">
              {new Date(ann.created_at).toLocaleDateString()}
            </div>
            <h3 className="text-2xl font-black uppercase mb-2 mr-24">{ann.title}</h3>
            <p className="font-bold text-gray-800 whitespace-pre-wrap">{ann.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="bg-gray-100 border-4 border-black p-8 text-center font-black uppercase text-gray-500">
            No announcements found.
          </div>
        )}
      </div>
    </div>
  );
}
