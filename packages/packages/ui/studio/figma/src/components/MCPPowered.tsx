import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Cpu, Database, Shield, Zap, GitBranch, FileCheck } from 'lucide-react';

export function MCPPowered() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const capabilities = [
    { icon: Database, text: 'Understanding your entire business context' },
    { icon: GitBranch, text: 'Knowing your data contracts' },
    { icon: FileCheck, text: 'Enforcing lineage' },
    { icon: Shield, text: 'Remembering your organizational rules' },
    { icon: Zap, text: 'Preventing errors before they happen' },
    { icon: Cpu, text: 'Designing micro-apps on the fly' },
  ];

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-2xl mb-6">
            <Cpu className="size-8 text-purple-400" />
          </div>
          <h2 className="mb-6">
            Powered by MCP — The Foundation of Intelligence
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            AI-BOS runs on MCP, the Model Context Protocol. This gives AI amazing powers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {capabilities.map((item, idx) => (
            <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="size-6 text-purple-400" />
              </div>
              <p className="text-slate-200">{item.text}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10"
        >
          <p className="text-2xl text-purple-200 mb-4">
            This is AI that works with discipline, not chaos.
          </p>
          <p className="text-lg text-slate-300">
            Everything is explainable. Everything is governed. Everything is safe.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
