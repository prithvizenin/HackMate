'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertOctagon, Shield, ShieldOff, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSuspend = async (id: number, currentStatus: boolean) => {
    setUsers(users.map(u => u.id === id ? { ...u, is_suspended: !currentStatus } : u));
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_suspended: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update suspension status');
      toast.success(`User ${currentStatus ? 'unsuspended' : 'suspended'}!`);
    } catch (err) {
      toast.error('Failed to update suspension status');
      fetchUsers();
    }
  };

  const toggleAdmin = async (id: number, currentStatus: boolean) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: !currentStatus }),
    });
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    const prevUsers = [...users];
    setUsers(users.filter(u => u.id !== id));
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      toast.success('User deleted completely!');
    } catch (err) {
      toast.error('Failed to delete user');
      setUsers(prevUsers);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-black" /></div>;

  return (
    <div className="animate-fade-in-up">
      <Toaster position="top-right" />
      <h1 className="text-5xl font-black uppercase text-black mb-10 tracking-tight bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">Manage Users</h1>
      
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-yellow-400 border-b-4 border-black">
            <tr>
              <th className="p-4 font-black uppercase text-lg border-r-4 border-black">User</th>
              <th className="p-4 font-black uppercase text-lg border-r-4 border-black">Email</th>
              <th className="p-4 font-black uppercase text-lg border-r-4 border-black">Status</th>
              <th className="p-4 font-black uppercase text-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className={`${i !== users.length - 1 ? 'border-b-4 border-black' : ''} hover:bg-gray-100 transition-colors`}>
                <td className="p-4 font-bold border-r-4 border-black">{user.name}</td>
                <td className="p-4 font-bold border-r-4 border-black">{user.email}</td>
                <td className="p-4 border-r-4 border-black">
                  <div className="flex flex-col gap-2">
                    {user.is_admin && <span className="inline-block bg-lime-400 text-black px-2 py-1 text-xs font-black uppercase border-2 border-black w-max">Admin</span>}
                    {user.is_suspended && <span className="inline-block bg-red-400 text-white px-2 py-1 text-xs font-black uppercase border-2 border-black w-max">Suspended</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => toggleAdmin(user.id, user.is_admin)}
                      className={`flex items-center px-3 py-1 font-black text-sm uppercase border-2 border-black transition-transform hover:-translate-y-1 ${user.is_admin ? 'bg-gray-300 text-black' : 'bg-lime-400 text-black'}`}
                    >
                      {user.is_admin ? <ShieldOff className="w-4 h-4 mr-1" /> : <Shield className="w-4 h-4 mr-1" />}
                      {user.is_admin ? 'Revoke' : 'Make Admin'}
                    </button>
                    <button 
                      onClick={() => toggleSuspend(user.id, user.is_suspended)}
                      className={`flex items-center px-3 py-1 font-black text-sm uppercase border-2 border-black transition-transform hover:-translate-y-1 ${user.is_suspended ? 'bg-cyan-400 text-black' : 'bg-orange-400 text-black'}`}
                    >
                      <AlertOctagon className="w-4 h-4 mr-1" />
                      {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="flex items-center px-3 py-1 font-black text-sm uppercase bg-red-500 text-white border-2 border-black transition-transform hover:-translate-y-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center font-black uppercase text-xl text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
