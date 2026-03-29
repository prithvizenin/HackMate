'use client';

import { useEffect } from 'react';
import supabase from '@/lib/db';

export default function RealtimeAnnouncements() {
  useEffect(() => {
    // Listen to inserts on the announcements table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          console.log('New announcement detected!', payload);
          // Force a full page reload so the UX gets the newest UI state
          window.location.reload();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
           console.log('Subscribed to realtime announcements channel.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
