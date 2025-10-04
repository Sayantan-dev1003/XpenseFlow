import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, TrendingUp, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#6C63FF]/20 to-[#B983FF]/20 border border-[#6C63FF]/30 mb-6"
            >
              <span className="text-sm font-medium text-[#E4D9FF]">
                🚀 Trusted by 10,000+ finance teams
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-poppins leading-tight mb-6"
            >
              Smarter Expense
              <br />
              <span className="gradient-text">Management</span>
              <br />
              for Modern Teams
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Streamline approvals, automate reimbursements, and stay audit-ready — all in one flow. 
              Transform your expense workflow with AI-powered OCR and multi-level approvals.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 glow-purple-lg transition-all duration-300"
                >
                  <span>Try Free</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>14-day free trial</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative">
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="relative"
            >
              {/* Main Dashboard Card */}
              <motion.div
                variants={itemVariants}
                className="glass-card rounded-2xl p-6 glow-purple"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Expense Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Monthly Expenses</p>
                        <p className="text-xs text-gray-400">+12% from last month</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#6C63FF]">$24,580</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#7A5CFA] to-[#6C63FF] rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pending Approvals</p>
                        <p className="text-xs text-gray-400">Awaiting review</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#7A5CFA]">8</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#B983FF] to-[#E4D9FF] rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Compliance Score</p>
                        <p className="text-xs text-gray-400">Audit ready</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#B983FF]">98%</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -top-4 -right-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-lg p-4 w-48 shadow-xl"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-white">Receipt Processed</span>
                </div>
                <p className="text-sm text-white font-medium">Starbucks Coffee - $4.50</p>
                <p className="text-xs text-gray-300">AI extracted • 2 min ago</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="absolute -bottom-4 -left-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-lg p-4 w-44 shadow-xl"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-[#6C63FF] rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-white">Approved</span>
                </div>
                <p className="text-sm text-white font-medium">Travel Expense</p>
                <p className="text-xs text-gray-300">Manager approved</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
