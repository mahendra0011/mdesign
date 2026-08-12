import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const FooterCTA = () => {
  return (
    <div className="w-full relative overflow-hidden bg-white">
      {/* Background Gradients for the CTA */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#f3e8ff] to-transparent rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
      
      {/* CTA Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[#eef2ff] text-[#4f46e5] rounded-2xl flex items-center justify-center mb-8 shadow-sm">
            <Sparkles size={32} strokeWidth={2} />
          </div>
          
          <h2 className="text-[50px] md:text-[70px] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8 max-w-4xl">
            Your next great product <br/>
            starts with a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#a855f7]">prompt.</span>
          </h2>
          
          <button className="group bg-[#111827] hover:bg-[#000000] text-white px-8 py-4 rounded-full font-bold text-[17px] flex items-center gap-3 transition-all shadow-[0_10px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_10px_40px_rgb(79,70,229,0.3)] hover:-translate-y-1">
            Start Designing Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Footer Section */}
      <footer className="w-full border-t border-gray-100 bg-[#fdfdfd] pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#a855f7] flex items-center justify-center">
                <span className="text-white font-black text-lg leading-none">M</span>
              </div>
              <span className="font-extrabold text-[22px] tracking-tight text-gray-900">
                DesignDroid AI
              </span>
            </div>

            {/* Links */}
            <div className="flex gap-8 text-[15px] font-semibold text-gray-600">
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Product</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Pricing</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Showcase</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Docs</a>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-6 text-[14px] font-semibold text-gray-500">
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">GitHub</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">LinkedIn</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-[13px] font-medium text-gray-400">
            <p>© 2024 DesignDroid AI Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterCTA;
