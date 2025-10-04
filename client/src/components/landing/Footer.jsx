import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Phone, MapPin, Twitter, Linkedin, Github, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Workflow', href: '#workflow' },
        { name: 'OCR Technology', href: '#ocr' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'API Documentation', href: '#' },
        { name: 'Integrations', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Press Kit', href: '#' },
        { name: 'Partners', href: '#' },
        { name: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Community', href: '#' },
        { name: 'Tutorials', href: '#' },
        { name: 'Webinars', href: '#' },
        { name: 'Case Studies', href: '#' },
        { name: 'Status Page', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'GDPR', href: '#' },
        { name: 'Security', href: '#' },
        { name: 'Compliance', href: '#' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Facebook, href: '#', label: 'Facebook' }
  ];

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer id="contact" className="relative bg-gradient-to-br from-[#0F0E17] via-[#1A1625] to-[#0F0E17] border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Zap className="w-8 h-8 text-[#6C63FF]" />
                  <div className="absolute inset-0 bg-[#6C63FF] blur-lg opacity-30 rounded-full"></div>
                </div>
                <span className="text-2xl font-bold font-poppins gradient-text">
                  XpenseFlow
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed max-w-md">
                Revolutionizing expense management with AI-powered automation, 
                seamless workflows, and intelligent approval systems for modern businesses.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-[#6C63FF]" />
                  <span className="text-sm">hello@xpenseflow.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-[#6C63FF]" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-[#6C63FF]" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gradient-to-r from-[#6C63FF]/20 to-[#B983FF]/20 border border-[#6C63FF]/30 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:border-[#6C63FF]/50 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white font-poppins">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('#') ? (
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-semibold text-white font-poppins mb-2">
                Stay updated with XpenseFlow
              </h3>
              <p className="text-gray-300 text-sm">
                Get the latest updates, tips, and insights delivered to your inbox.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="glass-card rounded-lg px-4 py-3 text-white placeholder-gray-400 border border-white/20 focus:border-[#6C63FF]/50 focus:outline-none transition-colors duration-200 w-full sm:w-80"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#6C63FF] to-[#B983FF] text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 glow-purple"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © 2024 XpenseFlow. All rights reserved. Built with ❤️ for modern finance teams.
            </p>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors duration-200">
                Sign In
              </Link>
              <Link to="/register" className="text-[#6C63FF] hover:text-[#7A5CFA] transition-colors duration-200 font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#6C63FF]/5 to-transparent pointer-events-none"></div>
    </footer>
  );
};

export default Footer;
