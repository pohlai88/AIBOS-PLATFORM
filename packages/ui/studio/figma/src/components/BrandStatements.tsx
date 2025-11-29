import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Quote } from 'lucide-react';

export function BrandStatements() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const statements = [
    "A Business OS that finally works the way people think.",
    "Built by AI. Governed by AI. Designed for humans.",
    "Business moves fast — now your systems can too.",
    "Not here to replace people. Here to remove chaos.",
    "Micro-apps in minutes. Workflows on demand. Compliance by default.",
    "Life can be chaotic. Work shouldn't be.",
  ];

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
            <Quote className="size-8 text-blue-600" />
          </div>
          <h2 className="text-slate-900 mb-4">
            Why AI-BOS Exists
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {statements.map((statement, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="size-6 text-blue-600 mb-4 opacity-50" />
              <p className="text-lg text-slate-700">{statement}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-white rounded-3xl p-12 text-center shadow-lg"
        >
          <blockquote className="text-2xl text-slate-700 mb-6 max-w-4xl mx-auto leading-relaxed">
            "AI-BOS is a Business Operating System, powered by AI and governed by metadata. 
            It helps people build micro-apps, workflows, and processes without coding. 
            AI assists humans, not replaces them. Everything is safe, transparent, and explainable."
          </blockquote>
          <p className="text-xl text-slate-900 mt-8">
            Work becomes simple. Work becomes enjoyable. Work becomes human again.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
