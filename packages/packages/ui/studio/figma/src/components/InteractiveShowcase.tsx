import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { Sparkles, Zap, Shield, Brain } from 'lucide-react';

export function InteractiveShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeTab, setActiveTab] = useState(0);

  const capabilities = [
    {
      icon: Sparkles,
      label: "Built by AI",
      title: "Express your intention",
      description: "You say what you want. AI translates business intent into working systems. No coding required.",
      visual: "Create a form, design a workflow, build a mini-app — all through natural conversation."
    },
    {
      icon: Shield,
      label: "Governed by AI",
      title: "Continuous validation",
      description: "AI enforces data contracts, remembers rules, prevents errors before they happen. Everything is explainable.",
      visual: "Compliance by default. Governance that doesn't slow you down."
    },
    {
      icon: Zap,
      label: "Self-Healing",
      title: "Systems that fix themselves",
      description: "AI detects issues, heals broken workflows, maintains schema integrity — automatically.",
      visual: "Sleep better knowing your systems are monitored 24/7 by intelligent agents."
    },
    {
      icon: Brain,
      label: "Powered by MCP",
      title: "Model Context Protocol",
      description: "The foundation that gives AI its power — understanding your entire business context and data lineage.",
      visual: "Discipline, not chaos. Intelligence with guardrails."
    }
  ];

  return (
    <section ref={ref} className="relative py-40 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] leading-[1] mb-8">
            A platform that
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
              builds with you
            </span>
          </h2>
        </motion.div>

        {/* Interactive tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {capabilities.map((cap, idx) => (
            <motion.button
              key={idx}
              onClick={() => setActiveTab(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-8 py-4 rounded-full border transition-all duration-300 flex items-center gap-3
                ${activeTab === idx 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white/5 text-white border-white/20 hover:border-white/40'}
              `}
            >
              <cap.icon className="size-5" />
              <span className="text-lg">{cap.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content display */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-12 md:p-16 border border-white/10"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-5xl md:text-6xl mb-6 leading-tight">
                {capabilities[activeTab].title}
              </h3>
              <p className="text-xl text-slate-400 mb-8">
                {capabilities[activeTab].description}
              </p>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-lg text-slate-300">
                  {capabilities[activeTab].visual}
                </p>
              </div>
            </div>

            {/* Visual representation */}
            <div className="relative h-96 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl absolute"
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative z-10 w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
              >
                {(() => {
                  const Icon = capabilities[activeTab].icon;
                  return <Icon className="size-24 text-white" />;
                })()}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}