'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeTransition() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Step 1: "Welcome to HackMate" (shows for 2 seconds)
    const stepTimer = setTimeout(() => {
      setStep(2);
    }, 2000);

    // Step 2: "Let's Setup Your Profile" (shows for 2 seconds before redirect)
    const redirectTimer = setTimeout(() => {
      router.push('/profile/setup');
    }, 4500);

    return () => {
      clearTimeout(stepTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-20"></div>
      
      {/* Decorative floating elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: 12 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-20 right-20 w-32 h-32 bg-yellow-400 brutal-border brutal-shadow"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: -15 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-20 left-20 w-48 h-48 bg-cyan-400 brutal-border brutal-shadow"
      />
      
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10 text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mix-blend-difference drop-shadow-[4px_4px_0_rgba(236,72,153,1)]">
              Welcome to<br/>HackMate
            </h1>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10 text-center"
          >
            <div className="bg-lime-400 border-4 border-black brutal-shadow px-10 py-8 rotate-[-2deg]">
              <h2 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tight">
                Let&apos;s Setup<br/>Your Profile
              </h2>
            </div>
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
              className="h-2 bg-pink-500 mt-8 mx-auto brutal-border"
              style={{ maxWidth: '300px' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
