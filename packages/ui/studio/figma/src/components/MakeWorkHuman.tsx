import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Heart, Zap, Smile, Lightbulb } from 'lucide-react';

export function MakeWorkHuman() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-32 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-6">
            <Heart className="size-8 text-blue-400" />
          </div>
          <h2 className="mb-6">
            We Are Not Here to Make Work Harder
          </h2>
          <p className="text-2xl text-blue-200 mb-8">
            We Are Here to Make Work Human Again
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-slate-800/50 rounded-3xl p-12 border border-slate-700">
            <p className="text-xl text-slate-300 mb-4">The goal of AI-BOS is simple:</p>
            <div className="space-y-4 text-2xl">
              <p className="text-white">Make work enjoyable.</p>
              <p className="text-white">Make work effective.</p>
              <p className="text-white">Make work feel like it finally fits.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { icon: Zap, title: 'No More Chaos', desc: 'Systems that work with you, not against you' },
            { icon: Smile, title: 'No More Broken Processes', desc: 'Workflows that actually flow' },
            { icon: Lightbulb, title: 'No More Complexity', desc: 'Build with thought, not code' },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/20 rounded-xl mb-4">
                <item.icon className="size-7 text-blue-400" />
              </div>
              <h3 className="mb-3">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-xl text-slate-300">
            You can build your own micro-apps, your own dashboards, your own workflows —
          </p>
          <p className="text-2xl text-blue-300 mt-4">
            not with code, but with thought.
          </p>
        </motion.div>
      </div>
    </section>
  );
}