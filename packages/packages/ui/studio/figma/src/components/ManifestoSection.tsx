import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';

export function ManifestoSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const manifesto = [
    { big: "We don't replace", small: "We empower" },
    { big: "We don't complicate", small: "We clarify" },
    { big: "We don't confuse", small: "We explain" },
    { big: "We don't add chaos", small: "We bring order" },
  ];

  return (
    <section ref={ref} className="relative py-40 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="mb-32 text-center"
        >
          <h2 className="text-[clamp(2.5rem,8vw,7rem)] leading-[1] mb-8">
            A system designed
            <br />
            by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">business</span>
            <br />
            not developers
          </h2>
        </motion.div>

        <div className="space-y-32">
          {manifesto.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -100 : 100 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: idx * 0.2 }}
              className={`flex flex-col md:flex-row items-center justify-between gap-12 ${
                idx % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <h3 className="text-[clamp(2rem,6vw,5rem)] leading-[1] text-slate-500 line-through">
                  {item.big}
                </h3>
              </div>
              <div className="flex-1">
                <h3 className="text-[clamp(2.5rem,7vw,6rem)] leading-[1] text-white">
                  {item.small}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 1 }}
          className="mt-40 text-center"
        >
          <div className="inline-block p-12 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-3xl border border-purple-500/20">
            <p className="text-3xl md:text-5xl leading-relaxed text-slate-300">
              This is AI that works with
              <br />
              <span className="text-white text-6xl md:text-7xl">discipline</span>
              <br />
              not chaos
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
