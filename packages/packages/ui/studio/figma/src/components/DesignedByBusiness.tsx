import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Users, Brain, Workflow } from 'lucide-react';

export function DesignedByBusiness() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
            <Brain className="size-8 text-blue-600" />
          </div>
          <h2 className="text-slate-900 mb-6">
            A System Designed by Business, Not Developers
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Most enterprise systems were written by engineers. AI-BOS was written by 
            business executives, operators, finance managers, HR leaders, supply chain owners — 
            and then translated into code by MCP + AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl p-12 shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-slate-900 mb-4">This is why it feels different</h3>
              <p className="text-slate-600 mb-6">
                It's not a system that forces you to adapt your process.
              </p>
              <p className="text-slate-900">
                It's a system that adapts to your real-world work.
              </p>
            </div>
            <div className="space-y-6">
              {[
                { icon: Users, text: 'Shaped by actual business operators' },
                { icon: Workflow, text: 'Reflects real-world processes' },
                { icon: Brain, text: 'Translated to code by AI' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <item.icon className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-slate-700">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
