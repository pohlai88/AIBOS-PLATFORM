import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function FinalCTA() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-6">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join the businesses who are making work human again with AI-BOS.
          </p>

          <div className="max-w-md mx-auto mb-12">
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8">
                Get Early Access
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>

          <p className="text-slate-400 mb-8">
            Or schedule a personalized demo with our team
          </p>

          <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Schedule Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 pt-16 border-t border-white/10"
        >
          <p className="text-2xl text-slate-200">
            Life can be chaotic. Your workplace doesn't have to be.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
