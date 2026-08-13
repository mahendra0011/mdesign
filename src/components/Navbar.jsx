import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-0 left-0 w-full h-[80px] flex items-center justify-between pl-[100px] pr-10 z-50 bg-transparent max-w-[1440px] mx-auto right-0"
    >
      <div className="flex items-center">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer mr-6 relative overflow-visible w-[140px] h-[50px]"
        >
          <img src="/logo.png" alt="DesignDroid AI Logo" className="absolute left-[-20px] top-[-42px] w-[310px] max-w-none mix-blend-multiply pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/design')}
          className="text-[14px] font-bold transition-colors text-[#111] hover:text-[#4c63f6]"
        >
          Design
        </button>
        <button 
          onClick={() => navigate('/auth')}
          className="text-[14px] font-bold transition-colors text-[#111] hover:text-[#4c63f6]"
        >
          Login
        </button>
        <button 
          onClick={() => navigate('/design')}
          className="text-[14px] font-bold px-6 py-2.5 rounded-full hover:scale-105 transition-all shadow-md flex items-center gap-2 bg-[#111] text-white hover:bg-black"
        >
          Generate <span className="text-[#5bd68f]">✦</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
