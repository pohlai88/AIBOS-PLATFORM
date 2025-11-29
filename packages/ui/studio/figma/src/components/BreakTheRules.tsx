import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export function BreakTheRules() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  const facts = [
    "No code",
    "No complexity",
    "No waiting for IT",
    "Just intention → Reality"
  ];

  return (
    <section ref={ref} className="relative py-40 overflow-hidden">
      {/* Dramatic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/50 to-black"></div>
      
      {/* Rotating element */}
      <motion.div 
        style={{ rotate, scale }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-500/20 to-blue-500/20 blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-32"
        >
          <h2 className="text-[clamp(3rem,10vw,9rem)] leading-[0.9] mb-12">
            With AI-BOS
            <br />
            you can do
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
              everything
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-32">
          {facts.map((fact, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer group"
            >
              <p className="text-4xl md:text-5xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                {fact}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block">
            <p className="text-3xl md:text-5xl text-slate-400 mb-8">
              This is the future of
            </p>
            <h3 className="text-[clamp(3rem,10vw,8rem)] leading-[1] text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400">
              enterprise work
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
