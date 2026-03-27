import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pink-400 flex pt-20">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-4 border-black brutal-shadow-right h-[calc(100vh-80px)] fixed top-20 left-0 z-10 hidden md:block">
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-8 border-b-4 border-black pb-4">Admin Menu</h2>
          <nav className="space-y-4 flex-1">
            <Link href="/admin" className="block text-xl font-bold p-3 border-4 border-black bg-cyan-400 hover:bg-yellow-400 brutal-shadow-hover transition-all uppercase">
              Users
            </Link>
            <Link href="/admin/hackathons" className="block text-xl font-bold p-3 border-4 border-black bg-lime-400 hover:bg-yellow-400 brutal-shadow-hover transition-all uppercase">
              Hackathons & Teams
            </Link>
            <Link href="/admin/announcements" className="block text-xl font-bold p-3 border-4 border-black bg-white hover:bg-yellow-400 brutal-shadow-hover transition-all uppercase">
              Announcements
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-[calc(100vh-80px)] relative z-0">
        {children}
      </main>
    </div>
  );
}
