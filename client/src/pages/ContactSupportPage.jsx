import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Send, 
  CheckCircle, 
  ArrowLeft,
  Headphones,
  FileText,
  Users,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactSupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: 'general',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: '24/7 Available',
      action: 'Start Chat',
      gradient: 'from-[#6C63FF] to-[#7A5CFA]',
      delay: 0.1
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed questions and get comprehensive answers',
      availability: 'Response within 2 hours',
      action: 'Send Email',
      gradient: 'from-[#7A5CFA] to-[#B983FF]',
      delay: 0.2
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our technical experts',
      availability: 'Mon-Fri, 9AM-6PM EST',
      action: 'Call Now',
      gradient: 'from-[#B983FF] to-[#E4D9FF]',
      delay: 0.3
    },
    {
      icon: FileText,
      title: 'Knowledge Base',
      description: 'Browse our comprehensive documentation and guides',
      availability: 'Always Available',
      action: 'Browse Docs',
      gradient: 'from-[#E4D9FF] to-[#6C63FF]',
      delay: 0.4
    }
  ];

  const quickHelp = [
    { icon: Zap, text: 'Account Setup & Configuration' },
    { icon: Users, text: 'User Management & Permissions' },
    { icon: Headphones, text: 'Technical Integration Support' }
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0E17] via-[#1A1625] to-[#0F0E17] text-white overflow-x-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 -right-40 w-96 h-96 bg-gradient-to-r from-[#7A5CFA] to-[#6C63FF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#B983FF] to-[#E4D9FF] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#6C63FF]/20 to-[#B983FF]/20 border border-[#6C63FF]/30 mb-6">
                <span className="text-sm font-medium text-[#E4D9FF]">
                  🎧 24/7 Support Available
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins mb-6">
                We're here to
                <br />
                <span className="gradient-text">help you succeed</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Get the support you need, when you need it. Our expert team is ready to help you 
                make the most of XpenseFlow with personalized assistance and guidance.
              </p>
            </motion.div>

            {/* Support Channels */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
              {supportChannels.map((channel, index) => (
                <motion.div
                  key={channel.title}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -10, 
                    transition: { duration: 0.3 } 
                  }}
                  className="group relative"
                >
                  <div className="glass-card rounded-2xl p-6 h-full hover:bg-white/10 transition-all duration-300 border-2 border-transparent hover:border-white/20">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-r ${channel.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <channel.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold font-poppins mb-3 text-white group-hover:text-[#E4D9FF] transition-colors duration-300">
                      {channel.title}
                    </h3>
                    
                    <p className="text-gray-300 leading-relaxed mb-3 text-sm">
                      {channel.description}
                    </p>

                    <p className="text-xs text-[#6C63FF] font-medium mb-4">
                      {channel.availability}
                    </p>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-2 px-4 bg-gradient-to-r from-[#6C63FF]/20 to-[#B983FF]/20 border border-[#6C63FF]/30 rounded-lg text-white text-sm font-medium hover:bg-gradient-to-r hover:from-[#6C63FF]/30 hover:to-[#B983FF]/30 transition-all duration-300"
                    >
                      {channel.action}
                    </motion.button>

                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${channel.gradient} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-3xl font-bold font-poppins mb-6 text-white">
                    Send us a message
                  </h2>
                  
                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all duration-300"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all duration-300"
                            placeholder="john@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Category
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all duration-300"
                          >
                            <option value="general">General Support</option>
                            <option value="technical">Technical Issue</option>
                            <option value="billing">Billing Question</option>
                            <option value="feature">Feature Request</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Priority
                          </label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all duration-300"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all duration-300"
                          placeholder="Brief description of your inquiry"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all duration-300 resize-none"
                          placeholder="Please provide as much detail as possible..."
                        />
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 glow-purple transition-all duration-300"
                      >
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </motion.button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                      <p className="text-gray-300 mb-6">
                        Thank you for contacting us. We'll get back to you within 2 hours.
                      </p>
                      <motion.button
                        onClick={() => setIsSubmitted(false)}
                        whileHover={{ scale: 1.05 }}
                        className="glass-card text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
                      >
                        Send Another Message
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Contact Info & Quick Help */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Contact Information */}
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="text-2xl font-bold font-poppins mb-6 text-white">
                    Get in Touch
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Email</p>
                        <p className="text-gray-300 text-sm">support@xpenseflow.com</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#7A5CFA] to-[#6C63FF] rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Phone</p>
                        <p className="text-gray-300 text-sm">+1 (555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#B983FF] to-[#E4D9FF] rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Business Hours</p>
                        <p className="text-gray-300 text-sm">Mon-Fri, 9AM-6PM EST</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#E4D9FF] to-[#6C63FF] rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Office</p>
                        <p className="text-gray-300 text-sm">San Francisco, CA</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Help */}
                <div className="glass-card rounded-2xl p-8">
                  <h3 className="text-2xl font-bold font-poppins mb-6 text-white">
                    Quick Help Topics
                  </h3>
                  
                  <div className="space-y-4">
                    {quickHelp.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-300 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-[#6C63FF] to-[#B983FF] rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-300 font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-gray-300 text-sm mb-4">
                      Need immediate assistance? Our live chat is available 24/7.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-[#6C63FF]/20 to-[#B983FF]/20 border border-[#6C63FF]/30 text-white py-3 rounded-lg font-semibold hover:bg-gradient-to-r hover:from-[#6C63FF]/30 hover:to-[#B983FF]/30 transition-all duration-300"
                    >
                      Start Live Chat
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactSupportPage;
