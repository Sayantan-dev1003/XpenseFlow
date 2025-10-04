import React from 'react';
import { motion } from 'framer-motion';
import { User, UserCheck, Building2, CheckCircle, ArrowRight, Upload, Eye, CreditCard } from 'lucide-react';

const WorkflowSection = () => {
  const workflowSteps = [
    {
      id: 1,
      title: 'Submit',
      description: 'Upload receipts with AI-powered data extraction',
      icon: Upload,
      bgColor: 'bg-slate-700/50',
      iconColor: 'text-blue-400',
      borderColor: 'border-slate-600/50'
    },
    {
      id: 2,
      title: 'Review',
      description: 'Manager approves or requests changes',
      icon: Eye,
      bgColor: 'bg-slate-700/50',
      iconColor: 'text-emerald-400',
      borderColor: 'border-slate-600/50'
    },
    {
      id: 3,
      title: 'Process',
      description: 'Automated reimbursement and record keeping',
      icon: CreditCard,
      bgColor: 'bg-slate-700/50',
      iconColor: 'text-purple-400',
      borderColor: 'border-slate-600/50'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 1, delay: 0.5, ease: "easeInOut" }
    }
  };

  return (
    <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              🔄 Smart Workflow
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins mb-6">
            Simple expense
            <br />
            <span className="gradient-text">approvals</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Three simple steps from expense submission to reimbursement. 
            Streamlined, automated, and audit-ready.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-12 relative max-w-4xl mx-auto">
              {/* Connecting Lines */}
              <div className="absolute top-16 left-0 right-0 flex items-center justify-center">
                <div className="flex items-center w-full px-16">
                  {[1, 2].map((index) => (
                    <motion.div
                      key={index}
                      variants={lineVariants}
                      className="flex-1 h-0.5 bg-slate-600 mx-8 rounded-full"
                    />
                  ))}
                </div>
              </div>

              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  variants={stepVariants}
                  whileHover={{ y: -5 }}
                  className="relative z-10"
                >
                  <div className={`${step.bgColor} ${step.borderColor} border rounded-xl p-6 text-center hover:bg-slate-600/50 transition-all duration-300`}>
                    {/* Step Number */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-6 h-6 bg-slate-600 border border-slate-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {step.id}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 bg-slate-800/50 rounded-xl flex items-center justify-center mb-4 mx-auto border border-slate-600/50">
                      <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold font-poppins mb-3 text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-6 max-w-md mx-auto">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={stepVariants}
                className="relative"
              >
                <div className={`${step.bgColor} ${step.borderColor} border rounded-xl p-6 hover:bg-slate-600/50 transition-all duration-300`}>
                  <div className="flex items-start space-x-4">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-600/50">
                          <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-600 border border-slate-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {step.id}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold font-poppins mb-2 text-white">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connecting Line for Mobile */}
                {index < workflowSteps.length - 1 && (
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: 24 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="w-0.5 bg-slate-600 mx-auto"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold font-poppins mb-4 text-white">
              Ready to simplify your expenses?
            </h3>
            <p className="text-gray-300 mb-6">
              Start with our free plan and scale as you grow.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-all duration-300"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default WorkflowSection;