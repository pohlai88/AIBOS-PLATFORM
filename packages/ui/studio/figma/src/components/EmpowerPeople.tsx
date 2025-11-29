import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Shield, Users, TrendingUp, CheckCircle } from 'lucide-react';

export function EmpowerPeople() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const beliefs = [
    'Humans remain the decision-makers',
    'AI is the assistant that removes friction',
    'AI reduces chaos, not jobs',
    'AI amplifies what people can do',
    'AI clarifies, does not confuse',
    'AI governs, protects, and explains',
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
            <Users className="size-8 text-green-600" />
          </div>
          <h2 className="text-slate-900 mb-6">
            We Don't Replace People — We Empower Them
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="text-slate-900 mb-8 text-center">We believe:</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {beliefs.map((belief, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">{belief}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12"
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl text-slate-700 mb-8">
              Work is messy. Life is messy.
            </p>
            <p className="text-3xl text-slate-900 mb-12">
              But the workplace doesn't have to stay that way.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                { icon: Shield, text: 'Things are where they should be' },
                { icon: TrendingUp, text: 'Processes flow instead of break' },
                { icon: CheckCircle, text: 'Data is consistent, not confusing' },
                { icon: Users, text: 'Decisions come with context and clarity' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="size-5 text-blue-600" />
                  </div>
                  <p className="text-slate-700 mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}