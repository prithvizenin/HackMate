'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Code, Trophy, ArrowRight, Terminal, Flame, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function Landing() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      router.replace('/browse');
    }
  }, [user, router]);

  if (mounted && user) return null; // Avoid flicker before redirect

  return (
    <div className="overflow-hidden bg-[#fdf8f5]">
      {/* Funky Marquee */}
      <div className="bg-black text-lime-400 brutal-border border-b-0 py-3 overflow-hidden relative z-20">
        <div className="animate-marquee whitespace-nowrap flex gap-10 font-bold text-xl uppercase tracking-widest">
          <span>🔥 Find Your Squad</span>
          <span>⚡ Build Cool Shit</span>
          <span>🏆 Win Hackathons</span>
          <span>💻 Write Buggy Code</span>
          <span>🔥 Find Your Squad</span>
          <span>⚡ Build Cool Shit</span>
          <span>🏆 Win Hackathons</span>
          <span>💻 Write Buggy Code</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center justify-center min-h-[85vh] text-center border-b-4 border-black bg-pink-400">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiPjwvcGF0aD4KPC9zdmc+')] z-0 hidden lg:block"></div>
        
        {/* Decorative Floating Elements */}
        <div className="absolute top-20 left-10 lg:left-32 animate-float hidden md:block z-10">
          <div className="bg-lime-400 brutal-shadow p-4 border-4 border-black -rotate-12">
            <Terminal className="h-10 w-10 text-black" />
          </div>
        </div>
        
        <div className="absolute bottom-20 right-10 lg:right-32 animate-float hidden md:block z-10" style={{ animationDelay: '1s' }}>
          <div className="bg-cyan-400 brutal-shadow p-4 border-4 border-black rotate-15">
            <Code className="h-10 w-10 text-black" />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-block bg-yellow-400 border-4 border-black brutal-shadow px-6 py-2 mb-8 -rotate-3 hover:rotate-0 transition-transform cursor-crosshair">
            <span className="font-extrabold text-black uppercase tracking-widest text-sm lg:text-base">🚀 The #1 App for Hackers</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-black tracking-tight mb-8 uppercase leading-[1.1] filter drop-shadow-[4px_4px_0_#fff]">
            Find Your<br /><span className="text-white filter drop-shadow-[6px_6px_0_#000]">HackMate.</span>
          </h1>
          
          <p className="mt-4 text-xl md:text-2xl text-black font-bold max-w-2xl mx-auto mb-12 bg-white/90 border-4 border-black p-6 brutal-shadow">
            Stop building alone. Find developers, designers, and visionaries to ship your next crazy idea.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-lime-400 text-black px-10 py-5 brutal-btn text-xl group flex items-center justify-center hover:bg-lime-300"
            >
              Get Started
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-white text-black px-10 py-5 brutal-btn text-xl hover:bg-gray-100"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-cyan-400 border-b-4 border-black relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-black text-black uppercase mb-6 drop-shadow-[4px_4px_0_#fff]">Why HackMate?</h2>
            <div className="h-4 w-32 bg-black mx-auto brutal-shadow"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white brutal-card p-10 hover:-translate-y-4 transition-transform duration-300">
              <div className="h-16 w-16 bg-pink-400 brutal-border brutal-shadow mb-8 flex items-center justify-center rotate-3">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-wide mb-4">Discover Talent</h3>
              <p className="text-lg text-black font-medium border-l-4 border-black pl-4">
                Filter by skills, roles, and experience. Find exactly who you need to complete your dream team.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-yellow-400 brutal-card p-10 hover:-translate-y-4 transition-transform duration-300 md:translate-y-8">
              <div className="h-16 w-16 bg-white brutal-border brutal-shadow mb-8 flex items-center justify-center -rotate-3">
                <Zap className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-wide mb-4">Connect Fast</h3>
              <p className="text-lg text-black font-medium border-l-4 border-black pl-4">
                Send requests with one click. Build your squad before the hackathon registration even closes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white brutal-card p-10 hover:-translate-y-4 transition-transform duration-300">
              <div className="h-16 w-16 bg-lime-400 brutal-border brutal-shadow mb-8 flex items-center justify-center rotate-6 animate-wiggle">
                <Trophy className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-wide mb-4">Win Together</h3>
              <p className="text-lg text-black font-medium border-l-4 border-black pl-4">
                Showcase your past achievements, flex your skills, and build projects that take the 1st prize.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-yellow-400 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 animate-fade-in-up">
          <div className="bg-white brutal-border brutal-shadow-lg p-12 md:p-20 rotate-1">
            <h2 className="text-4xl md:text-6xl font-black text-black uppercase mb-8">Ready to Build?</h2>
            <p className="text-xl md:text-2xl text-black font-bold mb-10">
              Join hundreds of hackers who are already shipping cool things together.
            </p>
            <Link 
              href="/register" 
              className="inline-flex bg-pink-500 text-white px-12 py-6 brutal-btn text-2xl hover:bg-pink-400 items-center justify-center"
            >
              <Flame className="mr-3 h-8 w-8 animate-wiggle" />
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
