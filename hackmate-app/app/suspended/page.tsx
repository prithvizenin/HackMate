import Link from 'next/link';
import { AlertTriangle, MessageSquareWarning } from 'lucide-react';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-red-400 flex flex-col items-center justify-center p-6 border-8 border-black font-sans relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-20 z-0"></div>

      <div className="bg-white brutal-card border-8 border-black shadow-[16px_16px_0_0_#000] p-12 max-w-2xl w-full text-center relative z-10 animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="bg-yellow-400 border-4 border-black brutal-shadow p-6 rotate-6 hover:-rotate-6 transition-transform">
            <AlertTriangle className="w-20 h-20 text-black" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-black mb-6">
          Account Suspended
        </h1>

        <div className="bg-black text-white font-bold p-6 border-4 border-black brutal-shadow mb-10 text-xl leading-relaxed">
          Your access to HackMate has been temporarily restricted due to a violation of our community guidelines.
        </div>

        <p className="font-bold text-gray-700 text-lg mb-10">
          If you believe this was a mistake or need more information, please reach out to our administration team.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="mailto:support@hackmate.tech"
            className="flex items-center justify-center bg-cyan-400 text-black px-8 py-4 brutal-btn border-4 border-black text-xl font-black uppercase hover:bg-cyan-300"
          >
            <MessageSquareWarning className="mr-3 h-6 w-6"  /> Contact Support
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center bg-lime-400 text-black px-8 py-4 brutal-btn border-4 border-black text-xl font-black uppercase hover:bg-lime-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
