import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Building2, ArrowRight, Star } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small teams getting started',
      icon: Zap,
      gradient: 'from-gray-600 to-gray-700',
      borderGradient: 'from-gray-500 to-gray-600',
      popular: false,
      features: [
        { name: 'Up to 5 users', included: true },
        { name: 'Basic OCR scanning', included: true },
        { name: '50 receipts/month', included: true },
        { name: 'Email support', included: true },
        { name: 'Multi-level approvals', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom workflows', included: false },
        { name: 'API access', included: false }
      ],
      cta: 'Get Started Free',
      delay: 0.1
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per user/month',
      description: 'Advanced features for growing businesses',
      icon: Crown,
      gradient: 'from-[#6C63FF] to-[#B983FF]',
      borderGradient: 'from-[#6C63FF] to-[#B983FF]',
      popular: true,
      features: [
        { name: 'Unlimited users', included: true },
        { name: 'Advanced AI OCR', included: true },
        { name: 'Unlimited receipts', included: true },
        { name: 'Priority support', included: true },
        { name: 'Multi-level approvals', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom workflows', included: true },
        { name: 'API access', included: false }
      ],
      cta: 'Start Pro Trial',
      delay: 0.2
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'Tailored solutions for large organizations',
      icon: Building2,
      gradient: 'from-[#7A5CFA] to-[#E4D9FF]',
      borderGradient: 'from-[#7A5CFA] to-[#E4D9FF]',
      popular: false,
      features: [
        { name: 'Unlimited everything', included: true },
        { name: 'White-label solution', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Multi-level approvals', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom workflows', included: true },
        { name: 'Full API access', included: true }
      ],
      cta: 'Contact Sales',
      delay: 0.3
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
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
              💰 Simple Pricing
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins mb-6">
            Start for free,
            <br />
            <span className="gradient-text">scale anytime</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your team. All plans include our core features 
            with no hidden fees or setup costs.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8 mb-16"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative group ${plan.popular ? 'lg:scale-105' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${plan.borderGradient} rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm`}></div>
              
              <div className={`glass-card rounded-2xl p-8 h-full transition-all duration-300 relative z-10 border-2 ${
                plan.popular 
                  ? 'border-[#6C63FF]/50 bg-gradient-to-br from-[#6C63FF]/10 to-[#B983FF]/10' 
                  : 'border-transparent group-hover:border-white/20'
              }`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold font-poppins mb-2 text-white">
                    {plan.name}
                  </h3>
                  
                  <p className="text-gray-300 mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className={`text-4xl font-bold font-poppins bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-400 text-sm">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {feature.included ? (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-white' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white glow-purple'
                      : 'glass-card text-white hover:bg-white/20'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold font-poppins mb-6 text-white">
              Frequently Asked Questions
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                {
                  q: 'Can I change plans anytime?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                },
                {
                  q: 'Is there a setup fee?',
                  a: 'No setup fees, no hidden costs. You only pay for what you use with transparent pricing.'
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, PayPal, and can arrange invoicing for Enterprise customers.'
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'Yes, we offer a 30-day money-back guarantee if you\'re not completely satisfied.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="space-y-2"
                >
                  <h4 className="font-semibold text-white">{faq.q}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-300 mb-4">
                Still have questions? We're here to help.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Contact Support
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/4 -right-40 w-80 h-80 bg-gradient-to-l from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-1/4 -left-40 w-72 h-72 bg-gradient-to-r from-[#7A5CFA] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
    </section>
  );
};

export default PricingSection;
