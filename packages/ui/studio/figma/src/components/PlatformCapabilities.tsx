import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { FileText, Workflow, Layout, BarChart3, Shield, Code, Zap, CheckCircle } from 'lucide-react';

export function PlatformCapabilities() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const capabilities = [
    { icon: FileText, text: 'Create a form' },
    { icon: Workflow, text: 'Design a workflow' },
    { icon: Layout, text: 'Build a mini-app' },
    { icon: BarChart3, text: 'Generate a dashboard' },
    { icon: Shield, text: 'Enforce compliance' },
    { icon: Code, text: 'Build ERP extensions' },
    { icon: Zap, text: 'Automate processes' },
    { icon: CheckCircle, text: 'Validate entries' },
  ];

  return (
    <section ref={ref} className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-slate-900 mb-6">
            A Platform That Builds With You
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Simply express your intention. AI builds it, checks it, validates it, and deploys it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {capabilities.map((item, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl text-center group hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                <item.icon className="size-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-slate-700">{item.text}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-4">With AI-BOS, you can do all of this:</p>
            <div className="space-y-3 text-left max-w-2xl mx-auto mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg">No code required</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg">No complexity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg">No waiting for IT</p>
              </div>
            </div>
            <p className="text-2xl">
              This is the future of enterprise work.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
