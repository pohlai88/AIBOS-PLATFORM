import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

export function PhilosophyGrid() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const beliefs = [
    {
      title: "Humans decide",
      subtitle: "AI assists",
      description: "You remain in control. Always."
    },
    {
      title: "AI removes",
      subtitle: "friction",
      description: "Not jobs. Not people. Just obstacles."
    },
    {
      title: "AI amplifies",
      subtitle: "what you can do",
      description: "Your capabilities, multiplied."
    },
    {
      title: "AI governs",
      subtitle: "protects, explains",
      description: "With discipline and transparency."
    },
    {
      title: "Build with",
      subtitle: "thought",
      description: "Not code. Express intention."
    },
    {
      title: "Work becomes",
      subtitle: "human again",
      description: "Simple. Enjoyable. Effective."
    }
  ];

  return (
    <section ref={ref} className="relative py-40 bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-[clamp(2.5rem,8vw,6rem)] leading-[1] mb-24 text-center"
        >
          We believe in
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
            empowering people
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beliefs.map((belief, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 60 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group"
            >
              <div className={`
                h-full p-8 rounded-2xl border transition-all duration-500
                ${hoveredIndex === idx 
                  ? 'bg-white text-black border-white scale-105' 
                  : 'bg-white/5 border-white/10 backdrop-blur-sm'}
              `}>
                <div className="mb-6">
                  <h3 className={`text-4xl mb-2 transition-colors ${
                    hoveredIndex === idx ? 'text-black' : 'text-white'
                  }`}>
                    {belief.title}
                  </h3>
                  <h4 className={`text-3xl transition-colors ${
                    hoveredIndex === idx 
                      ? 'text-purple-600' 
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400'
                  }`}>
                    {belief.subtitle}
                  </h4>
                </div>
                <p className={`text-lg transition-colors ${
                  hoveredIndex === idx ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {belief.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
