'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function LiveBackground() {
  const { scrollYProgress } = useScroll();

  // Parallax transformations
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '150%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const y4 = useTransform(scrollYProgress, [0, 1], ['0%', '-200%']);

  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [45, -45]);
  const rotate3 = useTransform(scrollYProgress, [0, 1], [15, 105]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Pink Diamond */}
      <motion.div
        style={{ y: y1, rotate: rotate2 }}
        className="absolute top-20 left-10 w-48 h-48 bg-pink-400 brutal-shadow brutal-border opacity-60"
      />
      
      {/* Cyan Circle */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/2 right-10 w-64 h-64 bg-cyan-400 rounded-full brutal-shadow brutal-border opacity-50"
      />
      
      {/* Yellow Square */}
      <motion.div
        style={{ y: y3, rotate: rotate3 }}
        className="absolute bottom-10 left-1/4 w-40 h-40 bg-yellow-400 brutal-shadow brutal-border opacity-70"
      />

      {/* Purple Pill */}
      <motion.div
        style={{ y: y4, rotate: rotate1 }}
        className="absolute top-1/4 left-2/3 w-32 h-72 bg-purple-400 rounded-full brutal-shadow brutal-border opacity-40"
      />
    </div>
  );
}
