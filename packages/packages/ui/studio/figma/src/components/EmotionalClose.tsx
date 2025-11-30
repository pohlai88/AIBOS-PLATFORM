import { motion } from 'motion/react';
import { useState } from 'react';
import { Input } from './ui/input';
import { ArrowRight } from 'lucide-react';

export function EmotionalClose() {
  const [email, setEmail] = useState('');

  return (
    <section className="relative py-40 bg-black">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2.5rem,8vw,7rem)] leading-[1] mb-12">
            Work is messy
            <br />
            <span className="text-slate-600">Life is messy</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Your workplace
              <br />
              doesn't have to be
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-12 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl border border-purple-500/20 backdrop-blur-sm">
            <p className="text-2xl md:text-3xl text-slate-300 mb-12 text-center leading-relaxed">
              AI-BOS helps people build micro-apps, workflows, and processes
              <br />
              <span className="text-white">without coding</span>
            </p>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-500 text-lg rounded-xl"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-black rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Get Early Access</span>
                  <ArrowRight className="size-5" />
                </motion.button>
              </div>

              <p className="text-center text-slate-500">
                Join the waitlist — be among the first to transform your enterprise
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-32 text-center space-y-8"
        >
          <p className="text-xl text-slate-600">
            AI assists humans
          </p>
          <p className="text-2xl text-slate-500">
            Not replaces them
          </p>
          <p className="text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-white">
            Work becomes human again
          </p>
        </motion.div>
      </div>
    </section>
  );
}
