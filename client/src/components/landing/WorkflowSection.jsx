import React from 'react';
import { motion } from 'framer-motion';
import { User, UserCheck, Building2, CheckCircle, ArrowRight, Upload, Eye, CreditCard } from 'lucide-react';

const WorkflowSection = () => {
  const workflowSteps = [
    {
      id: 1,
      title: 'Employee',
      subtitle: 'Submit Expense',
      description: 'Upload receipts and fill expense details with AI assistance',
      icon: User,
      color: '#6C63FF',
      actions: ['Upload receipt', 'Auto-fill details', 'Submit for approval']
    },
    {
      id: 2,
      title: 'Manager',
      subtitle: 'Review & Approve',
      description: 'Review expense details and approve or request changes',
      icon: UserCheck,
      color: '#7A5CFA',
      actions: ['Review details', 'Check policy', 'Approve/Reject']
    },
    {
      id: 3,
      title: 'Finance',
      subtitle: 'Process Payment',
      description: 'Verify compliance and process reimbursement',
      icon: Building2,
      color: '#B983FF',
      actions: ['Verify compliance', 'Process payment', 'Update records']
    },
    {
      id: 4,
      title: 'Director',
      subtitle: 'Final Oversight',
      description: 'High-value expense oversight and audit trail',
      icon: CheckCircle,
      color: '#E4D9FF',
      actions: ['Final review', 'Audit trail', 'Compliance check']
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
            Seamless approval
            <br />
            <span className="gradient-text">workflow process</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From submission to reimbursement, every step is automated and tracked. 
            Experience the most efficient expense approval workflow in the industry.
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
            <div className="grid grid-cols-4 gap-8 relative">
              {/* Connecting Lines */}
              <div className="absolute top-16 left-0 right-0 flex items-center justify-between px-16">
                {[1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    variants={lineVariants}
                    className="flex-1 h-0.5 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] mx-4 origin-left"
                  />
                ))}
              </div>

              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  variants={stepVariants}
                  whileHover={{ y: -10 }}
                  className="relative z-10"
                >
                  <div className="glass-card rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 border-2 border-transparent hover:border-white/20">
                    {/* Step Number */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {step.id}
                      </div>
                    </div>

                    {/* Icon */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                      style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}40` }}
                    >
                      <step.icon className="w-8 h-8" style={{ color: step.color }} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold font-poppins mb-1 text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm font-medium mb-3" style={{ color: step.color }}>
                      {step.subtitle}
                    </p>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Actions */}
                    <div className="space-y-2">
                      {step.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full mr-2"></div>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-6">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={stepVariants}
                className="relative"
              >
                <div className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}40` }}
                        >
                          <step.icon className="w-6 h-6" style={{ color: step.color }} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {step.id}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold font-poppins mb-1 text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm font-medium mb-2" style={{ color: step.color }}>
                        {step.subtitle}
                      </p>
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Actions */}
                      <div className="space-y-1">
                        {step.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-center text-xs text-gray-400">
                            <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full mr-2"></div>
                            {action}
                          </div>
                        ))}
                      </div>
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
                    className="w-0.5 bg-gradient-to-b from-[#6C63FF] to-[#B983FF] mx-auto"
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
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold font-poppins mb-4 text-white">
              Ready to streamline your workflow?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of companies already using XpenseFlow to automate their expense management.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto glow-purple transition-all duration-300"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-[#7A5CFA] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default WorkflowSection;
