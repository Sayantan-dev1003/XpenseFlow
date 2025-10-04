import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FileText, Zap, CheckCircle, Upload, Scan, CreditCard, Calendar, MapPin } from 'lucide-react';

const OCRDemoSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const demoSteps = [
    {
      id: 0,
      title: 'Upload Receipt',
      description: 'Drag & drop or take a photo',
      icon: Upload,
      color: '#6C63FF'
    },
    {
      id: 1,
      title: 'AI Processing',
      description: 'OCR extracts data automatically',
      icon: Scan,
      color: '#7A5CFA'
    },
    {
      id: 2,
      title: 'Data Extracted',
      description: 'All fields populated instantly',
      icon: CheckCircle,
      color: '#B983FF'
    }
  ];

  const receiptData = {
    merchant: 'Starbucks Coffee',
    amount: '$12.45',
    date: '2024-10-04',
    category: 'Meals & Entertainment',
    location: 'New York, NY',
    tax: '$1.12',
    tip: '$2.00'
  };

  const handleDemoClick = () => {
    if (activeStep < 2) {
      setIsProcessing(true);
      setTimeout(() => {
        setActiveStep(activeStep + 1);
        setIsProcessing(false);
      }, 1500);
    } else {
      setActiveStep(0);
    }
  };

  return (
    <section id="ocr" className="py-20 px-4 sm:px-6 lg:px-8 relative">
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
              🤖 AI-Powered OCR
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins mb-6">
            Scan receipts with
            <br />
            <span className="gradient-text">AI precision</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our advanced OCR technology extracts data from receipts with 99% accuracy. 
            No more manual data entry - just snap, scan, and submit.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Demo Interface */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Receipt Upload Area */}
            <div className="glass-card rounded-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold font-poppins mb-2 text-white">
                  Receipt Scanner Demo
                </h3>
                <p className="text-gray-300">
                  Experience our AI-powered OCR in action
                </p>
              </div>

              {/* Upload Zone */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-[#6C63FF]/50 rounded-xl p-8 mb-6 bg-[#6C63FF]/5 hover:bg-[#6C63FF]/10 transition-all duration-300 cursor-pointer"
                onClick={handleDemoClick}
              >
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    {activeStep === 0 && (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="space-y-4"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-2xl flex items-center justify-center mx-auto">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white mb-2">
                            Upload Receipt
                          </p>
                          <p className="text-gray-300 text-sm">
                            Click to start demo or drag & drop your receipt
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 1 && (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="space-y-4"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-[#7A5CFA] to-[#B983FF] rounded-2xl flex items-center justify-center mx-auto">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Scan className="w-8 h-8 text-white" />
                          </motion.div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white mb-2">
                            AI Processing...
                          </p>
                          <p className="text-gray-300 text-sm">
                            Extracting data with OCR technology
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 2 && (
                      <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="space-y-4"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-[#B983FF] to-[#E4D9FF] rounded-2xl flex items-center justify-center mx-auto">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white mb-2">
                            Data Extracted!
                          </p>
                          <p className="text-gray-300 text-sm">
                            All fields populated automatically
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {demoSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeStep >= index 
                        ? 'bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white' 
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    {index < demoSteps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                        activeStep > index 
                          ? 'bg-gradient-to-r from-[#6C63FF] to-[#B983FF]' 
                          : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Demo Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDemoClick}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {activeStep === 2 ? 'Try Again' : 'Start Demo'}
              </motion.button>
            </div>
          </motion.div>

          {/* Right Side - Extracted Data */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-poppins text-white">
                    Expense Form
                  </h3>
                  <p className="text-sm text-gray-300">Auto-populated by AI</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Merchant */}
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: activeStep >= 2 ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-300">Merchant</label>
                  <div className="glass-card rounded-lg p-3 flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 text-[#6C63FF]" />
                    <span className="text-white font-medium">
                      {activeStep >= 2 ? receiptData.merchant : 'Merchant name...'}
                    </span>
                  </div>
                </motion.div>

                {/* Amount */}
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: activeStep >= 2 ? 1 : 0.3 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-300">Amount</label>
                  <div className="glass-card rounded-lg p-3 flex items-center space-x-3">
                    <span className="text-2xl font-bold text-[#6C63FF]">$</span>
                    <span className="text-white font-medium text-lg">
                      {activeStep >= 2 ? receiptData.amount.slice(1) : '0.00'}
                    </span>
                  </div>
                </motion.div>

                {/* Date & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: activeStep >= 2 ? 1 : 0.3 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-300">Date</label>
                    <div className="glass-card rounded-lg p-3 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#7A5CFA]" />
                      <span className="text-white text-sm">
                        {activeStep >= 2 ? receiptData.date : 'YYYY-MM-DD'}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: activeStep >= 2 ? 1 : 0.3 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-300">Category</label>
                    <div className="glass-card rounded-lg p-3">
                      <span className="text-white text-sm">
                        {activeStep >= 2 ? receiptData.category : 'Category...'}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: activeStep >= 2 ? 1 : 0.3 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-300">Location</label>
                  <div className="glass-card rounded-lg p-3 flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-[#B983FF]" />
                    <span className="text-white">
                      {activeStep >= 2 ? receiptData.location : 'Location...'}
                    </span>
                  </div>
                </motion.div>

                {/* Accuracy Badge */}
                {activeStep >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex items-center justify-center space-x-2 mt-6 p-3 bg-green-500/20 rounded-lg border border-green-500/30"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">99% Accuracy Achieved</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold font-poppins mb-6 text-white">
              Why our OCR is different
            </h3>
            
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Process receipts in under 2 seconds' },
                { icon: CheckCircle, title: '99% Accurate', desc: 'Industry-leading accuracy rates' },
                { icon: FileText, title: 'Any Format', desc: 'Works with photos, PDFs, and scans' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-300 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-gradient-to-l from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-r from-[#7A5CFA] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
    </section>
  );
};

export default OCRDemoSection;
