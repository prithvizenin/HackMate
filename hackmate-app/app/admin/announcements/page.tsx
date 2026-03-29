'use client';

import { Megaphone, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin_announcements'],
    queryFn: async () => {
      const res = await fetch('/api/admin/announcements');
      if (!res.ok) throw new Error('Failed to fetch announcements');
      return res.json();
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', content: '' }
  });

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementFormValues) => {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create announcement');
      return res.json();
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
    },
    onError: () => alert('Failed to create announcement')
  });

  if (isLoading && announcements.length === 0) return <div className="flex items-center justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-black" /></div>;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-5xl font-black uppercase text-black mb-10 tracking-tight bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">Announcements</h1>
      
      <div className="bg-white border-4 border-black p-8 mb-12 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center"><Megaphone className="mr-2 h-6 w-6" /> Publish Announcement</h2>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block font-black uppercase mb-1">Title</label>
            <input type="text" {...register("title")} className="w-full border-4 border-black p-3 text-lg font-bold focus:bg-cyan-100 outline-none transition-colors" />
            {errors.title && <p className="text-red-500 font-bold text-sm mt-1 uppercase">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block font-black uppercase mb-1">Content</label>
            <textarea {...register("content")} rows={4} className="w-full border-4 border-black p-3 text-lg font-bold focus:bg-cyan-100 outline-none transition-colors resize-y" />
            {errors.content && <p className="text-red-500 font-bold text-sm mt-1 uppercase">{errors.content.message}</p>}
          </div>
          <button type="submit" disabled={createMutation.isPending} className="brutal-btn bg-cyan-400 py-3 px-8 text-xl mt-4 disabled:opacity-50 flex items-center gap-2">
            {createMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {createMutation.isPending ? 'PUBLISHING...' : 'PUBLISH NOW'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase mb-4">Past Announcements</h2>
        {announcements.map((ann: any) => (
          <div key={ann.id} className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6 relative">
            <div className="absolute top-0 right-0 bg-yellow-400 border-l-4 border-b-4 border-black px-3 py-1 font-black uppercase text-xs">
              {format(new Date(ann.created_at), 'PPP')}
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
