'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import supabase from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { Send, Clock, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [connections, setConnections] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchConnections = async () => {
      try {
        const res = await api.get('/api/connections');
        setConnections(res.data || []);
      } catch (err) {
        console.error('Failed to load connections', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConnections();
    }
  }, [user, authLoading, router]);

  const loadMessages = async (friendId: number) => {
    try {
      const res = await api.get(`/api/messages?userId=${friendId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    if (!activeChat || !user) return;

    loadMessages(activeChat.id);

    // Subscribe to incoming messages
    const channel = supabase.channel(`chat_${user.id}_${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`, 
        },
        (payload) => {
          if (payload.new.sender_id === activeChat.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Optimistically add message
    const tempMsg = {
      id: Date.now(),
      sender_id: user?.id,
      receiver_id: activeChat.id,
      content,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post('/api/messages', { receiverId: activeChat.id, content });
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message');
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row h-[calc(100vh-80px)] opacity-50 pointer-events-none">
         <div className="w-full h-full bg-gray-200 animate-pulse brutal-card" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 relative z-10">
      
      {/* Sidebar - Connections */}
      <div className="w-full md:w-1/3 flex flex-col brutal-card bg-white h-full border-b-8 border-r-8 border-black">
        <div className="p-6 border-b-4 border-black bg-pink-400">
          <h2 className="text-2xl font-black text-black uppercase tracking-widest flex items-center">
            <MessageSquare className="mr-3 h-6 w-6" /> 
            Inbox
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {connections.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold">
              No connections to chat with yet.
            </div>
          ) : (
            connections.map(conn => (
              <button
                key={conn.id}
                onClick={() => setActiveChat(conn)}
                className={`w-full text-left p-6 border-b-4 border-black transition-all hover:bg-yellow-200 ${activeChat?.id === conn.id ? 'bg-yellow-400' : 'bg-white'}`}
              >
                <div className="font-black text-black text-lg uppercase">{conn.name}</div>
                <div className="text-gray-700 font-bold text-sm flex items-center mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-lime-500 mr-2" />
                  {conn.role}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full md:w-2/3 flex flex-col brutal-card bg-white h-full border-b-8 border-l-8 border-black">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b-4 border-black bg-cyan-400 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-black uppercase tracking-tight">{activeChat.name}</h3>
                <p className="text-sm font-bold text-black opacity-80">{activeChat.college}</p>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-yellow-200 border-b-4 border-black p-3 flex items-center justify-center font-bold text-sm uppercase tracking-wide text-black">
              <Clock className="w-4 h-4 mr-2" />
              Messages disappear after 24 hours
            </div>

            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 font-bold italic opacity-70">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  No messages in the last 24 hours. Connect and say hi!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id || i} className={`max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                      <div 
                        className={`p-4 brutal-shadow border-4 border-black font-bold text-black ${
                          isMe ? 'bg-lime-400' : 'bg-white'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className={`text-xs mt-2 font-bold opacity-60 flex items-center ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t-4 border-black bg-white">
              <form onSubmit={sendMessage} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-100 border-4 border-black p-4 font-bold text-black brutal-shadow focus:outline-none focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-pink-400 text-black border-4 border-black px-8 font-black uppercase tracking-widest hover:bg-pink-300 disabled:opacity-50 transition-all brutal-shadow hover:-translate-y-1 active:translate-y-1"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-yellow-400 border-4 border-black brutal-shadow p-8 rotate-3 mb-6">
              <MessageSquare className="w-16 h-16 text-black" />
            </div>
            <h3 className="text-3xl font-black text-black uppercase mb-4">Select a Connection</h3>
            <p className="font-bold text-gray-600 text-xl">Choose someone from your inbox to start chatting.</p>
          </div>
        )}
      </div>

    </div>
  );
}
