import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import QueryProvider from '@/components/QueryProvider';
import RealtimeAnnouncements from '@/components/RealtimeAnnouncements';
import MouseTrail from '@/components/MouseTrail';
import LiveBackground from '@/components/LiveBackground';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Find My HackMate',
  description: 'Find your perfect hackathon teammate',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <QueryProvider>
          <AuthProvider>
            <LiveBackground />
            <MouseTrail />
            <RealtimeAnnouncements />
            <div className="relative z-10 min-h-screen flex flex-col pt-20 bg-transparent">
              <Navbar />
              <main className="grow">
                {children}
              </main>
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
