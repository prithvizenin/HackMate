'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { Code, Flame, Zap, Trophy, Terminal, Users } from 'lucide-react';

export default function LandingLiveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const springConfig = { damping: 25, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to range [-1, 1] relative to center
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Create parallax transforms for different elements
  const x1 = useTransform(smoothX, [-1, 1], [60, -60]);
  const y1 = useTransform(smoothY, [-1, 1], [60, -60]);
  
  const x2 = useTransform(smoothX, [-1, 1], [-80, 80]);
  const y2 = useTransform(smoothY, [-1, 1], [-80, 80]);

  const x3 = useTransform(smoothX, [-1, 1], [40, -40]);
  const y3 = useTransform(smoothY, [-1, 1], [40, -40]);

  const x4 = useTransform(smoothX, [-1, 1], [-100, 100]);
  const y4 = useTransform(smoothY, [-1, 1], [100, -100]);

  const x5 = useTransform(smoothX, [-1, 1], [120, -120]);
  const y5 = useTransform(smoothY, [-1, 1], [120, -120]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Container blocks clicks so it stays strictly in the background */}
      
      {/* Shape 1: Pink circle with terminal */}
      <motion.div style={{ x: x1, y: y1 }} className="absolute top-1/4 left-[10%]">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [12, 16, 12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-pink-400 brutal-shadow p-6 brutal-border rounded-full opacity-70 flex items-center justify-center"
        >
          <Terminal className="h-12 w-12 text-black" />
        </motion.div>
      </motion.div>

      {/* Shape 2: Yellow square with Zap */}
      <motion.div style={{ x: x2, y: y2 }} className="absolute bottom-1/3 right-[15%]">
        <motion.div 
          animate={{ y: [0, 25, 0], rotate: [-12, -8, -12] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="bg-yellow-400 brutal-shadow-lg p-8 brutal-border opacity-80 flex items-center justify-center"
        >
          <Zap className="h-16 w-16 text-black" />
        </motion.div>
      </motion.div>

      {/* Shape 3: Cyan pill with Code */}
      <motion.div style={{ x: x3, y: y3 }} className="absolute top-[60%] left-[20%]">
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [45, 50, 45] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="bg-cyan-400 brutal-shadow p-3 brutal-border rounded-full opacity-60 flex items-center justify-center"
        >
          <div className="flex items-center space-x-2 px-4 py-2">
            <Code className="h-8 w-8 text-black" />
            <span className="font-bold text-black uppercase tracking-widest hidden md:inline">Hack</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Shape 4: Lime shape with Flame */}
      <motion.div style={{ x: x4, y: y4 }} className="absolute top-[10%] right-[30%]">
        <motion.div 
          animate={{ y: [0, -25, 0], rotate: [30, 20, 30] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="bg-lime-400 brutal-shadow p-5 brutal-border opacity-75 flex items-center justify-center"
        >
          <Flame className="h-10 w-10 text-black animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Shape 5: Purple square with Trophy */}
      <motion.div style={{ x: x5, y: y5 }} className="absolute bottom-[20%] left-[40%]">
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [-20, -25, -20] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="bg-purple-400 brutal-shadow-lg p-6 brutal-border opacity-50 flex items-center justify-center"
        >
          <Trophy className="h-14 w-14 text-black" />
        </motion.div>
      </motion.div>

      {/* Shape 6: White square with Users */}
      <motion.div style={{ x: x1, y: y2 }} className="absolute top-[40%] right-[5%]">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [60, 65, 60] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="bg-white brutal-shadow p-7 brutal-border opacity-65 flex items-center justify-center"
        >
          <Users className="h-12 w-12 text-black" />
        </motion.div>
      </motion.div>
    </div>
  );
}
