import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ArrowDown } from 'lucide-react';

export function DramaticHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <section ref={ref} className="relative h-[200vh]">
      <motion.div 
        style={{ opacity, scale }}
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Dramatic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950 to-black"></div>
        
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(120, 0, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(0, 100, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(255, 0, 200, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(120, 0, 255, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            {/* Oversized, dramatic headline */}
            <h1 className="text-[clamp(3rem,12vw,11rem)] leading-[0.9] mb-12 tracking-tight">
              Life is
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                chaotic
              </span>
            </h1>
            
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-[clamp(2rem,6vw,5rem)] leading-[1.1] mb-16 text-slate-300"
            >
              Your workplace
              <br />
              doesn't have to be
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16"
            >
              AI-BOS is the business operating system built by AI, governed by AI,
              <br className="hidden md:block" />
              designed to make work <span className="text-white">human again</span>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-black text-lg rounded-full hover:bg-slate-200 transition-colors"
              >
                Enter AI-BOS
              </motion.button>
            </div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="size-6 text-slate-600" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
