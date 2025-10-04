import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Brain, DollarSign, Shield, ArrowRight, Zap, Clock, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Briefcase,
      title: 'Multi-Level Approvals',
      description: 'Customizable approval workflows that adapt to your organizational hierarchy and expense policies.',
      gradient: 'from-[#6C63FF] to-[#7A5CFA]',
      delay: 0.1
    },
    {
      icon: Brain,
      title: 'AI & OCR Receipts',
      description: 'Intelligent receipt scanning that automatically extracts data and categorizes expenses with 99% accuracy.',
      gradient: 'from-[#7A5CFA] to-[#B983FF]',
      delay: 0.2
    },
    {
      icon: DollarSign,
      title: 'Auto Currency Conversion',
      description: 'Real-time currency conversion with automatic exchange rate updates for global expense management.',
      gradient: 'from-[#B983FF] to-[#E4D9FF]',
      delay: 0.3
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Granular permissions and role-based access control to ensure data security and compliance.',
      gradient: 'from-[#E4D9FF] to-[#6C63FF]',
      delay: 0.4
    }
  ];

  const additionalFeatures = [
    { icon: Zap, text: 'Lightning-fast processing' },
    { icon: Clock, text: 'Real-time notifications' },
    { icon: Users, text: 'Team collaboration tools' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#6C63FF]/20 to-[#B983FF]/20 border border-[#6C63FF]/30 mb-6">
            <span className="text-sm font-medium text-[#E4D9FF]">
              ✨ Powerful Features
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins mb-6">
            Everything you need to
            <br />
            <span className="gradient-text">manage expenses</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From AI-powered receipt scanning to multi-level approvals, XpenseFlow provides 
            all the tools your finance team needs to streamline expense management.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                transition: { duration: 0.3 } 
              }}
              className="group relative"
            >
              <div className="glass-card rounded-2xl p-6 h-full hover:bg-white/10 transition-all duration-300 border-2 border-transparent hover:border-white/20">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold font-poppins mb-3 text-white group-hover:text-[#E4D9FF] transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed mb-4">
                  {feature.description}
                </p>


                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold font-poppins mb-6 text-white">
              Plus many more features to boost your productivity
            </h3>
            
            <div className="grid sm:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3 justify-center sm:justify-start"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-y-1/2"></div>
      <div className="absolute top-1/4 right-0 w-48 h-48 bg-gradient-to-r from-[#7A5CFA] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
    </section>
  );
};

export default FeaturesSection;
