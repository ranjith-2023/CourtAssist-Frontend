// src/components/pages/FrontPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const hoverEffect = {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  };

  const tapEffect = {
    scale: 0.98,
    transition: { duration: 0.1 }
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 antialiased p-4 md:p-8 flex items-center justify-center">
      {/* Main Card */}
      <motion.section
        className="relative w-full max-w-6xl rounded-3xl bg-[#0b1a2e] text-white shadow-2xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Navigation */}
        <motion.div
          className="flex items-center justify-between px-6 sm:px-10 pt-6"
          variants={itemVariants}
        >
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 grid place-items-center hover:bg-white/20 transition-all duration-300">
              <span className="text-2xl font-bold">⚖️</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Court Assist</h1>
            </div>
          </motion.div>

          {/* Navigation Links - Only Sign Up and Login */}
          <nav className="hidden md:flex items-center gap-6 text-white/90 text-sm">
            <motion.button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-900 px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={hoverEffect}
              whileTap={tapEffect}
            >
              Sign Up
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/login')}
              className="border border-white/30 px-6 py-2.5 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
              whileHover={hoverEffect}
              whileTap={tapEffect}
            >
              Log In
            </motion.button>
          </nav>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold text-sm"
              whileHover={hoverEffect}
              whileTap={tapEffect}
            >
              Sign Up
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              className="border border-white/30 px-4 py-2 rounded-lg text-sm"
              whileHover={hoverEffect}
              whileTap={tapEffect}
            >
              Log In
            </motion.button>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 sm:px-10 pt-12 pb-16 lg:pb-20"
          variants={containerVariants}
        >
          {/* Content */}
          <motion.div
            className="relative z-10 space-y-6"
            variants={itemVariants}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              variants={itemVariants}
            >
              Never Miss a{" "}
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                Court Hearing
              </span>{" "}
              Again
            </motion.h1>

            <motion.p
              className="text-lg text-blue-200 leading-relaxed max-w-xl"
              variants={itemVariants}
            >
              Track your cases and set reminders to stay organized.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleGetStarted}
                className="bg-amber-400 text-blue-900 px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "#fbbf24"
                }}
                whileTap={tapEffect}
              >
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Simplified Visual Element */}
          <motion.div
            className="relative flex items-center justify-center"
            variants={itemVariants}
          >
            <motion.div
              className="relative w-64 h-64 lg:w-80 lg:h-80"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Main icon */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-300/30 rounded-3xl backdrop-blur-sm border border-amber-300/30"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(251, 191, 36, 0.25)"
                }}
                transition={{ duration: 0.3 }}
              />
              
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-8xl">⚖️</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
    </main>
  );
};

export default FrontPage;