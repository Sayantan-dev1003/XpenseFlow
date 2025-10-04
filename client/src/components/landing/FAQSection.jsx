import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does the OCR receipt scanning work?",
      answer: "Our OCR technology automatically scans and extracts data from receipts, invoices, and other expense documents. Simply upload a photo or PDF, and our system will extract merchant name, amount, date, and other relevant details with high accuracy."
    },
    {
      question: "What approval workflows are available?",
      answer: "XpenseFlow supports customizable multi-level approval workflows. You can set up different approval chains based on expense amount, department, or expense type. Managers can approve expenses, and high-value expenses can require additional approvals from directors or finance teams."
    },
    {
      question: "Is my data secure and compliant?",
      answer: "Yes, we take security seriously. All data is encrypted in transit and at rest. We're SOC 2 compliant and follow industry best practices for data protection. Your expense data is stored securely and only accessible to authorized users within your organization."
    },
    {
      question: "Can I integrate with existing accounting systems?",
      answer: "Absolutely! XpenseFlow integrates with popular accounting software including QuickBooks, Xero, SAP, and NetSuite. You can also export data in various formats (CSV, Excel, PDF) for manual import into any system."
    },
    {
      question: "How much does XpenseFlow cost?",
      answer: "We offer flexible pricing plans starting from $5 per user per month. Our plans include different features and user limits. We also offer a 14-day free trial with no credit card required, so you can test the platform before committing."
    },
    {
      question: "What currencies are supported?",
      answer: "XpenseFlow supports over 150 currencies with real-time exchange rate updates. The system automatically converts expenses to your base currency and maintains historical exchange rates for accurate reporting and compliance."
    },
    {
      question: "Can I use XpenseFlow on mobile devices?",
      answer: "Yes! XpenseFlow is fully responsive and works on all devices. We also offer native mobile apps for iOS and Android, allowing employees to submit expenses, take receipt photos, and track approvals on the go."
    },
    {
      question: "How do I get started with XpenseFlow?",
      answer: "Getting started is easy! Sign up for our free trial, invite your team members, and configure your approval workflows. Our onboarding team will help you set up everything and provide training to ensure a smooth transition."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins">
              Frequently Asked <span className="gradient-text">Questions</span>
              <br />
            </h2>
          </div>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Got questions? We've got answers. Find everything you need to know about XpenseFlow 
            and how it can transform your expense management process.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card rounded-2xl overflow-hidden border-2 border-transparent hover:border-white/20 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-[#6C63FF]" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="h-px bg-gradient-to-r from-transparent via-[#6C63FF]/30 to-transparent mb-4"></div>
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-2xl font-bold font-poppins mb-4 text-white">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our support team is here to help. Contact us for personalized assistance 
              or schedule a demo to see XpenseFlow in action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white px-8 py-3 rounded-xl font-semibold glow-purple transition-all duration-300"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-[#7A5CFA] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default FAQSection;
