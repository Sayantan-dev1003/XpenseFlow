import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const benefits = [
    {
      icon: Zap,
      text: 'Setup in under 5 minutes'
    },
    {
      icon: Shield,
      text: 'Enterprise-grade security'
    },
    {
      icon: Clock,
      text: '24/7 customer support'
    },
    {
      icon: CheckCircle,
      text: '99.9% uptime guarantee'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF] via-[#7A5CFA] to-[#B983FF] rounded-3xl opacity-90"></div>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center py-16 px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins text-white mb-6 leading-tight">
                Simplify expense approvals
                <br />
                <span className="text-[#E4D9FF]">today</span>
              </h2>
              
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Join 10,000+ companies already transforming their expense management 
                with XpenseFlow's intelligent automation.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)' 
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#6C63FF] px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-2 shadow-2xl hover:shadow-white/20 transition-all duration-300"
                >
                  <span>Start Your Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Schedule Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-3 justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-lg p-3"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 font-medium text-sm">
                    {benefit.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Additional Trust Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-8 text-white/80 text-sm"
            >
              <p>✨ No credit card required • 14-day free trial • Cancel anytime</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid sm:grid-cols-3 gap-8 text-center"
        >
          {[
            { number: '10,000+', label: 'Happy Customers' },
            { number: '99.2%', label: 'Customer Satisfaction' },
            { number: '50M+', label: 'Receipts Processed' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="text-3xl sm:text-4xl font-bold font-poppins gradient-text mb-2">
                {stat.number}
              </div>
              <p className="text-gray-300 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-64 w-80 h-80 bg-gradient-to-l from-[#7A5CFA] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

export default CTASection;
