import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

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
        <AuthProvider>
          <div className="min-h-screen flex flex-col pt-20">
            <Navbar />
            <main className="grow">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
