import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Building2, Users, TrendingUp } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Finance Director',
      company: 'TechCorp Inc.',
      avatar: 'SC',
      rating: 5,
      text: 'XpenseFlow transformed our expense management completely. The OCR accuracy is incredible and the approval workflow saves us 10+ hours per week.',
      gradient: 'from-[#6C63FF] to-[#7A5CFA]',
      delay: 0.1
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Operations Manager',
      company: 'Global Dynamics',
      avatar: 'MR',
      rating: 5,
      text: 'The multi-level approval system is exactly what we needed. Our compliance scores improved dramatically since implementing XpenseFlow.',
      gradient: 'from-[#7A5CFA] to-[#B983FF]',
      delay: 0.2
    },
    {
      id: 3,
      name: 'Emily Watson',
      role: 'CFO',
      company: 'StartupX',
      avatar: 'EW',
      rating: 5,
      text: 'As a growing startup, we needed something scalable and efficient. XpenseFlow delivered beyond our expectations with seamless integration.',
      gradient: 'from-[#B983FF] to-[#E4D9FF]',
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins mb-6">
            Trusted by forward-thinking
            <br />
            <span className="gradient-text">finance teams</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of companies that have revolutionized their expense management 
            with XpenseFlow's intelligent automation and seamless workflows.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8 mb-16"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm`}></div>
              
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300 relative z-10 border-2 border-transparent group-hover:border-white/20">
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4">
                  <div className={`w-8 h-8 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center`}>
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-sm text-[#6C63FF]">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold font-poppins mb-4 text-white">
              Ready to join our satisfied customers?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the same transformation that thousands of finance teams have already achieved with XpenseFlow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-gradient-to-l from-[#7A5CFA] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
    </section>
  );
};

export default TestimonialsSection;