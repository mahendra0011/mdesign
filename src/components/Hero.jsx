import { Link } from "react-router-dom";
import { Command, Activity, Share2, Edit2, Plus, ArrowUpRight, Gauge, MousePointer2, Play } from 'lucide-react';
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="w-full h-[100vh] bg-[#fcfcfd] flex items-center justify-center overflow-hidden font-sans">

      {/* MASTER CANVAS: 1440x800 */}
      <div className="relative w-[1440px] h-[800px] shrink-0 mx-auto">

        {/* ==================== RIGHT SIDE GRAPHICS ==================== */}

        {/* 1. Pale White Background Circle (IN FRONT of purple card) */}
        <div className="absolute left-[685px] top-[125px] z-[15]">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8], rotate: [0, 8, 0] }}
            transition={{ 
              scale: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              opacity: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2.5 }
            }}
            className="w-[550px] h-[550px] rounded-full bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)]" 
          />
        </div>

        {/* 2. Mint Crescent Circle (IN FRONT of purple card) */}
        <div className="absolute left-[735px] top-[175px] z-[16]">
          <motion.div 
            animate={{ scale: [1, 1.08, 1], rotate: [0, 15, 0] }}
            transition={{ 
              scale: { repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.5 },
              rotate: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2.5 }
            }}
            className="w-[450px] h-[450px] rounded-full bg-[#c8ecd8]" 
          />
        </div>

        {/* 3. The Purple Gradient Card (NEELI PATTI) - Static wrapper sets z-index (BEHIND the circle group) */}
        <div className="absolute left-[1020px] top-[40px] z-[5]">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="w-[480px] h-[720px] bg-gradient-to-br from-[#ae76f8] via-[#8b6cf6] to-[#5262f5] rounded-l-[56px] shadow-2xl overflow-hidden relative"
            >
              {/* Faint Checkerboard Texture */}
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)', backgroundSize: '20px 20px' }} />

              {/* Top Right Window Dots */}
              <div className="absolute top-[24px] right-[32px] flex gap-2.5 items-center">
                <div className="w-4 h-4 rounded-full bg-white/50"></div>
                <div className="w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Bottom Toolbar inside Purple Card */}
              <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 w-[80%] h-[64px] bg-white rounded-full shadow-2xl flex items-center justify-between px-6 pointer-events-auto">
                <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"><Gauge size={22} className="text-gray-500 hover:text-black" /></div>
                <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"><Share2 size={22} className="text-gray-500 hover:text-black" /></div>
                <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"><Edit2 size={22} className="text-gray-500 hover:text-black" /></div>
                <div className="w-12 h-12 bg-[#4c63f6] rounded-full flex items-center justify-center shadow-lg shadow-[#4c63f6]/40 cursor-pointer hover:scale-105 transition-transform">
                  <Plus size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 4. White Arc & Mouse Pointer - moved up/right onto the clear purple area, clear of the circle */}
        <div className="absolute left-[1180px] top-[90px] z-40 w-[220px] h-[220px]">
          <svg className="absolute top-0 left-0 w-full h-full overflow-visible" viewBox="0 0 220 220">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.6, duration: 1.3 }}
              d="M 20 20 A 150 150 0 0 1 200 200"
              fill="none" stroke="white" strokeWidth="2.5"
            />
            {/* Start and End white dots */}
            <circle cx="20" cy="20" r="5" fill="white" />
            <circle cx="200" cy="200" r="5" fill="white" />
          </svg>
          
          {/* Animated Mouse Pointer + Blue Dot tracing the arc together */}
          <motion.div
            initial={{ offsetDistance: "0%", opacity: 0 }}
            animate={{ offsetDistance: ["0%", "100%", "0%"], opacity: 1 }}
            transition={{ 
              offsetDistance: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2.5 },
              opacity: { delay: 1.9, duration: 0.9, ease: "easeOut" }
            }}
            style={{ 
              offsetPath: 'path("M 20 20 A 150 150 0 0 1 200 200")',
              offsetRotate: '0deg'
            }}
            className="absolute left-0 top-0 drop-shadow-xl flex items-center justify-center -ml-2 -mt-2"
          >
            {/* The Blue Dot */}
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute w-3.5 h-3.5 bg-[#4c63f6] border-[3px] border-white rounded-full shadow-sm"
            />
            {/* The Mouse Pointer touching the dot */}
            <motion.div
              animate={{ x: [-2, 2, -2], y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute left-1 top-1"
            >
              <MousePointer2 size={30} className="text-[#111] fill-[#111] -rotate-12" />
            </motion.div>
          </motion.div>
        </div>

        {/* 5. Target Green Circle (BADA WALA CIRCLE) - perfectly concentric with the other two rings */}
        <div className="absolute left-[820px] top-[260px] z-[17]">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", duration: 1 }}
          >
            <motion.div
              animate={{ y: [-12, 12, -12], rotate: [0, 25, 0] }}
              transition={{ 
                y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2.5 }
              }}
              className="w-[280px] h-[280px] rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center"
            >
              <div className="w-[180px] h-[180px] rounded-full bg-[#e0f5e8] flex items-center justify-center shadow-inner">
                <div className="w-[120px] h-[120px] rounded-full bg-[#5ad58f] shadow-lg shadow-[#5ad58f]/40 flex items-center justify-center">
                  <ArrowUpRight size={56} strokeWidth={3} className="text-[#111]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 6. Dark Donut - nudged to sit cleanly on the bottom edge of the circle group */}
        <div className="absolute left-[910px] top-[520px] z-50">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.7, type: "spring" }}
          >
            <motion.div
              animate={{ rotate: 360, y: [5, -5, 5] }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 25, ease: "linear" },
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              className="w-[120px] h-[120px] rounded-full border-[24px] border-[#1c1d24] shadow-2xl"
            />
          </motion.div>
        </div>

        {/* 7. Top-Left Widget (Skeleton) - shifted left slightly to clear the bigger circle group */}
        <div className="absolute left-[600px] top-[130px] z-50">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.7 }}
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="w-[260px] h-[150px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 border border-gray-50 flex flex-col justify-between"
            >
              <div className="flex gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28ca41]"></div>
              </div>
              <div className="space-y-4">
                <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden relative">
                  <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                </div>
                <div className="w-[70%] h-3.5 bg-gray-100 rounded-full overflow-hidden relative">
                  <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.3 }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                </div>
                <div className="w-[50%] h-4 bg-[#111] rounded-full"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 8. Bottom-Left Chart Widget - shifted left slightly to line up under the new circle position */}
        <div className="absolute left-[640px] top-[590px] z-40">
          <motion.div 
            animate={{ y: [8, -8, 8] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-[260px] h-[140px] bg-[#fafafa] rounded-[24px] border border-gray-100 bg-[linear-gradient(to_right,#eee_1px,transparent_1px),linear-gradient(to_bottom,#eee_1px,transparent_1px)] bg-[size:16px_16px]" 
          />
        </div>

        <div className="absolute left-[660px] top-[560px] z-50">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.7 }}
          >
            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-[260px] h-[140px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-5 border border-gray-50 flex flex-col justify-between"
            >
              <div className="flex gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#28ca41]"></div>
              </div>
              <div className="flex items-end justify-between h-[50px] px-1 gap-3">
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 2, duration: 0.4 }} className="w-full h-full flex items-end origin-bottom">
                  <motion.div animate={{ height: ['35%', '60%', '35%'] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="w-full bg-[#111] rounded-t-md" />
                </motion.div>
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 2.05, duration: 0.4 }} className="w-full h-full flex items-end origin-bottom">
                  <motion.div animate={{ height: ['60%', '30%', '60%'] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="w-full bg-[#5ad58f] rounded-t-md" />
                </motion.div>
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 2.1, duration: 0.4 }} className="w-full h-full flex items-end origin-bottom">
                  <motion.div animate={{ height: ['40%', '80%', '40%'] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="w-full bg-[#111] rounded-t-md" />
                </motion.div>
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 2.15, duration: 0.4 }} className="w-full h-full flex items-end origin-bottom">
                  <motion.div animate={{ height: ['100%', '50%', '100%'] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="w-full bg-[#4c63f6] rounded-t-md" />
                </motion.div>
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 2.2, duration: 0.4 }} className="w-full h-full flex items-end origin-bottom">
                  <motion.div animate={{ height: ['50%', '90%', '50%'] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} className="w-full bg-[#111] rounded-t-md" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Global SVG Line - adjusted end point to meet the new node position */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <svg className="w-full h-full" viewBox="0 0 1440 800">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.3, duration: 1.2, ease: "easeInOut" }}
              d="M 472 622 C 580 622, 660 432, 780 432"
              fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Moving Blue Dot Tracing the Global Line */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-30">
          <motion.div
            initial={{ offsetDistance: "0%", scale: 0 }}
            animate={{ offsetDistance: ["0%", "100%", "0%"], scale: 1 }}
            transition={{
              offsetDistance: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 },
              scale: { delay: 1.9, duration: 0.5 }
            }}
            style={{ 
              offsetPath: 'path("M 472 622 C 580 622, 660 432, 780 432")',
              offsetRotate: '0deg'
            }}
            className="absolute left-0 top-0 w-4 h-4 bg-[#4c63f6] rounded-full border-[3px] border-white shadow-md -ml-2 -mt-2"
          />
        </div>

        {/* Blue Play Triangle */}
        <div className="absolute left-[730px] top-[450px] z-40">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <Play size={20} className="text-[#4485fe] fill-[#4485fe]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Purple Activity Node */}
        <div className="absolute left-[780px] top-[400px] z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.3, type: "spring" }}
          >
            <motion.div
              animate={{ y: [4, -4, 4], rotate: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="w-[64px] h-[64px] bg-[#7c72f0] rounded-[18px] flex items-center justify-center shadow-2xl shadow-[#7c72f0]/30"
            >
              <Activity className="text-white" size={26} />
            </motion.div>
          </motion.div>
        </div>

        {/* Orange Command Node */}
        <div className="absolute left-[440px] top-[590px] z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring" }}
          >
            <motion.div
              animate={{ y: [-4, 4, -4], rotate: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-[64px] h-[64px] bg-[#f56143] rounded-[18px] flex items-center justify-center shadow-2xl shadow-[#f56143]/30"
            >
              <Command className="text-white" size={28} />
            </motion.div>
          </motion.div>
        </div>

        {/* ==================== LEFT SIDE TEXT ==================== */}

        <div className="absolute left-[100px] top-[160px] w-[500px] z-40">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[96px] font-extrabold leading-[1.0] tracking-tight text-[#111111] mb-8"
          >
            Design
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="inline-block ml-4 text-[#5bd68f] text-[65px] leading-none align-middle -translate-y-6"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              >
                ✦
              </motion.div>
            </motion.span>
            <br />
            websites,<br />
            <span className="relative inline-block z-10">
              with AI
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-3 left-0 right-[-10px] h-[22px] bg-[#9cf1c2] rounded-full -z-10 origin-left"
              ></motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-[#6b7280] text-[18px] leading-[1.6] max-w-[400px] font-medium mb-12"
          >
            Just type a prompt and watch our AI instantly generate stunning, production-ready websites in seconds. ✨
          </motion.p>
        </div>

        {/* Try for free Button */}
        <div className="absolute left-[100px] top-[560px] z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link to="/auth" className="inline-block bg-[#18181b] text-white px-10 py-5 rounded-full font-bold text-[16px] hover:bg-black hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
              Start generating for free
            </Link>
          </motion.div>
        </div>

        {/* Logos at the bottom left */}
        <div className="absolute left-[100px] bottom-[40px] flex items-center gap-10 opacity-40 grayscale pointer-events-none z-40">
          <span className="text-[22px] font-bold tracking-tighter">OpenAI</span>
          <span className="text-[22px] font-black tracking-widest text-[#111]">VERCEL</span>
          <div className="flex items-center gap-2 font-bold text-[20px] text-[#111]">
            <div className="w-5 h-5 rounded-full bg-[#111]"></div>Figma
          </div>
          <span className="text-[24px] font-bold tracking-tight text-[#111]">stripe</span>
        </div>

      </div>
    </div>
  );
};

export default Hero;