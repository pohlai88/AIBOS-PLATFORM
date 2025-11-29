import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';

export function Vision() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-slate-900 mb-6">
            A New Category of Enterprise Platform
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {[
            { title: 'Built by AI', desc: 'AI translates business intent into working systems' },
            { title: 'Governed by AI', desc: 'Continuous validation, healing, and compliance' },
            { title: 'Self-Healing', desc: 'Systems that fix themselves before issues arise' },
          ].map((item, idx) => (
            <div key={idx} className="p-8 bg-slate-50 rounded-2xl">
              <h3 className="text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
            Orchestrated by <span className="text-blue-600">MCP (Model Context Protocol)</span>, 
            created not by engineers, but by business people who know the real pains.
          </p>
          <p className="text-lg text-slate-600 mt-6">
            This is software that understands work — because it was shaped by the people who actually do it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
