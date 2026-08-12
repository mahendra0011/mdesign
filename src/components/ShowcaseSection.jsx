import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Layers, Cloud, LayoutGrid, Droplet, Circle, 
  ChevronDown, Mic, Menu, ArrowRight, Users
} from 'lucide-react';

const ShowcaseSection = () => {
  return (
    <section className="w-full pt-9 pb-10 bg-white font-sans relative overflow-hidden">
      
      {/* Decorative Blobs (Background) */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[116px] left-[4.9%] opacity-80 pointer-events-none hidden lg:block"
      >
         <div className="flex">
           <div className="w-10 h-20 bg-[#a855f7] rounded-l-full"></div>
           <div className="w-10 h-20 bg-[#22c55e] rounded-r-full ml-0.5"></div>
         </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[42px] right-[8.2%] opacity-80 pointer-events-none hidden lg:block"
      >
         <div className="flex gap-1.5 justify-end mb-6 mr-6">
           <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
         </div>
         <div className="relative w-40 h-24 mt-2">
            <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_2px,transparent_2px)] [background-size:16px_16px] rotate-[-10deg] opacity-40"></div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <path d="M 10 90 C 10 30, 90 30, 90 30" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="10" cy="90" r="3" fill="white" stroke="#6b7280" strokeWidth="1.5" />
              <circle cx="90" cy="30" r="3" fill="white" stroke="#6b7280" strokeWidth="1.5" />
            </svg>
         </div>
      </motion.div>
      
      <div className="absolute bottom-[70px] left-[13%] opacity-80 pointer-events-none hidden lg:flex items-end">
        <motion.div animate={{ rotate: [0, 90, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-16 h-16 rounded-full border-4 border-black mr-[-10px] z-10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-black"></div>
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="w-12 h-12 rounded-full bg-[#20c997] mb-4"></motion.div>
      </div>


      <div className="max-w-[1376px] mx-auto px-0 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-[19px]"
        >
          <div className="bg-[#eff6ff] text-[#6366f1] px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 mb-5 shadow-sm border border-[#e0e7ff]">
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <Sparkles size={12} className="fill-[#6366f1]" /> 
            </motion.div>
            AI Design Generator
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-[3rem] font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.08]">
            Describe it. Generate it. <span className="text-[#6366f1]">Design</span> it.
          </h2>
          <p className="text-gray-500 text-base md:text-[17px] max-w-xl leading-[1.55]">
            Turn your ideas into stunning, production-ready UI designs for <br className="hidden md:block" />
            <span className="font-bold text-[#6366f1]">Web & Mobile</span> in seconds.
          </p>
        </motion.div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] gap-8 lg:gap-[38px] items-start mb-8">
          
          {/* Left Column (Text & Features) */}
          <div className="w-full flex flex-col relative z-20 pt-[31px]">
            <motion.h3 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[32px] lg:text-[32px] font-extrabold text-gray-900 mb-4 leading-[1.12] tracking-[-0.6px]"
            >
              Your idea,<br/>
              <span className="text-[#20c997] relative inline-block">
                beautifully
                <motion.svg 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-1.5 left-0 w-full h-2 text-[#20c997]/40" 
                  viewBox="0 0 100 10" 
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </motion.svg>
              </span><br/>
              generated
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-500 text-[13px] mb-[29px] leading-[1.75] max-w-[270px]"
            >
              Our AI understands your prompt and generates clean, modern, and fully layered UI designs that you can customize and ship.
            </motion.p>

            {/* Hand-drawn Arrow (Desktop) */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="hidden xl:block absolute top-[43%] -right-[39px] z-20 pointer-events-none"
            >
               <motion.div animate={{ x: [0, -5, 0], y: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                 <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                   <path d="M 0 30 Q 30 0 55 10" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
                   <path d="M 48 4 L 56 10 L 48 18" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                 </svg>
               </motion.div>
            </motion.div>

            {/* Feature List */}
            <div className="flex flex-col gap-[21px]">
               {[
                 { icon: <Sparkles size={16}/>, color: "text-[#9333ea]", bg: "bg-[#f3e8ff]", title: "Smart AI Generation", desc: "Advanced AI turns your prompt into high-quality UI designs." },
                 { icon: <Zap size={16}/>, color: "text-[#22c55e]", bg: "bg-[#dcfce7]", title: "Web & Mobile Ready", desc: "Get responsive designs for both platforms in one click." },
                 { icon: <Layers size={16}/>, color: "text-[#f97316]", bg: "bg-[#ffedd5]", title: "Fully Editable", desc: "Customize every detail, layout, color, typography and more." },
                 { icon: <Cloud size={16}/>, color: "text-[#3b82f6]", bg: "bg-[#dbeafe]", title: "Export & Share", desc: "Export clean assets or share with your team instantly." }
               ].map((feature, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                   className="flex items-start gap-3 group"
                 >
                   <motion.div 
                     animate={{ y: [0, -4, 0] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
                     className={`w-9 h-9 rounded-full ${feature.bg} ${feature.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
                   >
                     {feature.icon}
                   </motion.div>
                   <div>
                     <h4 className="text-[13px] font-bold text-gray-900 mb-0.5">{feature.title}</h4>
                     <p className="text-[11px] text-gray-500 leading-relaxed max-w-[220px]">{feature.desc}</p>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Right Column (Mockups Container) */}
          <div className="w-full relative flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full h-[616px] bg-[#f0fdf4] rounded-[32px] relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_35px_rgba(34,197,94,0.025)]"
            >
              {/* Scalable inner container */}
              <div className="w-[980px] h-[555px] relative origin-center shrink-0">
                
                {/* 1. Prompt Box Panel */}
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="absolute top-0 left-0 w-[280px] h-[555px] z-10"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                    className="w-full h-full bg-white rounded-[18px] shadow-[0_12px_32px_rgb(0,0,0,0.055)] p-5 border border-gray-100 flex flex-col"
                  >
                  <h4 className="font-bold text-[13px] text-gray-800 mb-4">Describe your design</h4>
                  <div className="w-full border border-gray-200 rounded-xl p-4 text-[13px] text-gray-600 h-[170px] mb-6 flex flex-col justify-between shadow-inner bg-gray-50/50">
                    <p className="leading-relaxed">Build a modern SaaS dashboard for project management tool with analytics, tasks, and team overview.</p>
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <div className="flex items-center gap-1 text-[#6366f1] bg-[#eef2ff] px-2.5 py-1.5 rounded-md text-[10px] font-bold cursor-pointer hover:bg-[#e0e7ff] transition-colors">
                        <Sparkles size={12} fill="#6366f1" /> Enhance Prompt
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">0/1000</span>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-[13px] text-gray-800 mb-4">Design Preferences</h4>
                  
                  <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-2.5 mb-3 shadow-sm cursor-pointer hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#6366f1] text-white flex items-center justify-center"><LayoutGrid size={14}/></div>
                    <div className="flex-1">
                       <div className="text-[9px] text-gray-400 font-bold mb-0.5">Style</div>
                       <div className="text-[11px] font-bold text-gray-800">Modern</div>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 mr-1" />
                  </div>
                  
                  <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-2.5 mb-3 shadow-sm cursor-pointer hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#20c997] text-white flex items-center justify-center"><Droplet size={14}/></div>
                    <div className="flex-1">
                       <div className="text-[9px] text-gray-400 font-bold mb-0.5">Primary Color</div>
                       <div className="text-[11px] font-bold text-gray-800">Nunito Green</div>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 mr-1" />
                  </div>
                  
                  <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-2.5 mb-5 shadow-sm cursor-pointer hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#8b5cf6] text-white flex items-center justify-center"><Circle size={14}/></div>
                    <div className="flex-1">
                       <div className="text-[9px] text-gray-400 font-bold mb-0.5">Tone</div>
                       <div className="text-[11px] font-bold text-gray-800">Professional</div>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 mr-1" />
                  </div>
                  
                  <button className="w-full mt-auto bg-[#6366f1] text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#4f46e5] transition-colors shadow-lg shadow-[#6366f1]/30">
                    <Sparkles size={14} /> Generate Design
                  </button>
                  </motion.div>
                </motion.div>

                {/* 2. Desktop Dashboard Panel */}
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="absolute top-0 left-[301px] w-[552px] h-[555px] z-20"
                >
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="w-full h-full bg-white rounded-[20px] shadow-[0_18px_45px_rgb(0,0,0,0.10)] p-6 border border-gray-100 flex flex-col"
                  >
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#8b5cf6] flex items-center justify-center"><span className="text-white text-[10px] font-bold">T</span></div>
                      <span className="font-extrabold text-gray-900 text-[13px]">Taskly</span>
                    </div>
                    <div className="flex gap-6 text-[11px] font-bold text-gray-500">
                      <span className="text-[#6366f1] bg-[#eef2ff] px-2.5 py-1 rounded-md">Dashboard</span>
                      <span className="hover:text-gray-800 cursor-pointer flex items-center">Projects</span>
                      <span className="hover:text-gray-800 cursor-pointer flex items-center">Tasks</span>
                      <span className="hover:text-gray-800 cursor-pointer flex items-center">Team</span>
                      <span className="hover:text-gray-800 cursor-pointer flex items-center">Reports</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-[#20c997] text-white flex items-center justify-center text-[9px] font-bold">JD</div>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <h2 className="font-extrabold text-[22px] text-gray-900 mb-1">Hello, James 👋</h2>
                  <p className="text-[11px] text-gray-400 mb-6 font-medium">Here's what's happening with your projects today.</p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {[
                      { title: "Total Projects", val: "24", trend: "+12% this month" },
                      { title: "Tasks Completed", val: "68%", trend: "+8% this month" },
                      { title: "In Progress", val: "12", trend: "+4% this month" },
                      { title: "Team Members", val: "8", trend: "+2 this month" },
                    ].map((stat, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-3.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                        <div className="text-[9px] text-gray-400 font-bold mb-1.5">{stat.title}</div>
                        <div className="text-[20px] font-black text-gray-900 mb-1.5 leading-none">{stat.val}</div>
                        <div className="text-[8px] text-[#20c997] font-bold">{stat.trend}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Charts & Lists Row */}
                  <div className="flex gap-4 flex-1 mb-5">
                    {/* Project Overview Chart */}
                    <div className="w-[60%] border border-gray-100 rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-[11px] font-bold text-gray-800">Project Overview</span>
                         <span className="text-[9px] text-gray-500 border border-gray-200 rounded px-1.5 py-0.5 flex items-center gap-1 cursor-pointer">This Week <ChevronDown size={10}/></span>
                       </div>
                       <div className="flex-1 relative w-full mt-2">
                         <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80">
                            {/* Grid lines */}
                            <line x1="0" y1="20" x2="200" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                            <line x1="0" y1="50" x2="200" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                            <line x1="0" y1="80" x2="200" y2="80" stroke="#f3f4f6" strokeWidth="1" />
                            {/* Y axis labels */}
                            <text x="-15" y="22" fill="#9ca3af" fontSize="6">100</text>
                            <text x="-12" y="52" fill="#9ca3af" fontSize="6">50</text>
                            <text x="-10" y="82" fill="#9ca3af" fontSize="6">0</text>
                            {/* X axis labels */}
                            <text x="10" y="95" fill="#9ca3af" fontSize="6">Mon</text>
                            <text x="40" y="95" fill="#9ca3af" fontSize="6">Tue</text>
                            <text x="70" y="95" fill="#9ca3af" fontSize="6">Wed</text>
                            <text x="100" y="95" fill="#9ca3af" fontSize="6">Thu</text>
                            <text x="130" y="95" fill="#9ca3af" fontSize="6">Fri</text>
                            <text x="160" y="95" fill="#9ca3af" fontSize="6">Sat</text>
                            <text x="190" y="95" fill="#9ca3af" fontSize="6">Sun</text>
                            
                            {/* Main Line */}
                            <motion.path d="M 10 70 L 40 50 L 70 60 L 100 40 L 130 30 L 160 55 L 190 35" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="5 5" animate={{ strokeDashoffset: [10, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                            {/* Nodes */}
                            <motion.circle cx="10" cy="70" r="2" fill="white" stroke="#8b5cf6" strokeWidth="1.5" animate={{ r: [2, 3, 2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.1 }} />
                            <motion.circle cx="40" cy="50" r="2" fill="white" stroke="#8b5cf6" strokeWidth="1.5" animate={{ r: [2, 3, 2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
                            <motion.circle cx="70" cy="60" r="2" fill="white" stroke="#8b5cf6" strokeWidth="1.5" animate={{ r: [2, 3, 2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
                            <motion.circle cx="100" cy="40" r="2" fill="white" stroke="#8b5cf6" strokeWidth="1.5" animate={{ r: [2, 3, 2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
                            <motion.circle cx="160" cy="55" r="2" fill="white" stroke="#8b5cf6" strokeWidth="1.5" animate={{ r: [2, 3, 2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                            <motion.circle cx="190" cy="35" r="2" fill="white" stroke="#8b5cf6" strokeWidth="1.5" animate={{ r: [2, 3, 2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
                            {/* Highlight Node */}
                            <circle cx="130" cy="30" r="2.5" fill="white" stroke="#20c997" strokeWidth="2" />
                            <rect x="120" y="8" width="20" height="12" rx="6" fill="#20c997" />
                            <text x="130" y="16" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">68%</text>
                            <path d="M 130 20 L 128 23 L 132 23 Z" fill="#20c997" />
                         </svg>
                       </div>
                    </div>
                    
                    {/* Recent Tasks List */}
                    <div className="w-[40%] border border-gray-100 rounded-xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col">
                       <span className="text-[11px] font-bold text-gray-800 block mb-3">Recent Tasks</span>
                       <div className="flex flex-col gap-2.5 flex-1">
                         <div className="flex justify-between items-center">
                           <span className="text-[9px] text-gray-600 font-medium">Design homepage</span>
                           <span className="text-[8px] text-[#20c997] bg-[#ecfdf5] px-1.5 py-0.5 rounded font-bold">In Progress</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-[9px] text-gray-600 font-medium">API integration</span>
                           <span className="text-[8px] text-[#20c997] bg-[#ecfdf5] px-1.5 py-0.5 rounded font-bold">In Progress</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-[9px] text-gray-400 font-medium line-through">Team meeting</span>
                           <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-bold">Done</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-[9px] text-gray-600 font-medium">Fix breadcrumb issue</span>
                           <span className="text-[8px] text-[#6366f1] bg-[#eef2ff] px-1.5 py-0.5 rounded font-bold">To Do</span>
                         </div>
                       </div>
                       <div className="text-[9px] font-bold text-[#6366f1] flex items-center gap-1 cursor-pointer mt-auto pt-2 border-t border-gray-50">
                         View all tasks <ArrowRight size={10} />
                       </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex gap-4">
                     <div className="w-1/2 flex flex-col justify-center">
                       <span className="text-[11px] font-bold text-gray-800 block mb-3">Team Activity</span>
                       <div className="flex items-center gap-3 mb-2">
                         <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" /></div>
                         <div className="flex-1">
                           <div className="text-[9px] text-gray-700 font-medium">Sarah completed 3 tasks</div>
                         </div>
                         <div className="text-[8px] text-gray-400">2h ago</div>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" alt="Mike" /></div>
                         <div className="flex-1">
                           <div className="text-[9px] text-gray-700 font-medium">Mike updated project status</div>
                         </div>
                         <div className="text-[8px] text-gray-400">4h ago</div>
                       </div>
                     </div>
                     <div className="w-1/2 flex items-center gap-6">
                       <div className="w-full h-px bg-gray-100 absolute left-0 top-0 hidden"></div>
                       <div className="flex flex-col flex-1 pl-4 border-l border-gray-100">
                         <span className="text-[11px] font-bold text-gray-800 block mb-2">Task Progress</span>
                         <div className="flex items-center gap-4">
                           {/* Donut Chart */}
                           <div className="w-14 h-14 relative shrink-0">
                             <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#20c997" strokeWidth="4" strokeDasharray="68, 100" />
                               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="24, 100" strokeDashoffset="-68" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-900">68%</div>
                           </div>
                           <div className="flex flex-col gap-1.5 w-full">
                             <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#20c997]"></div><span className="text-[8px] font-bold text-gray-600">Done</span></div><span className="text-[8px] font-bold text-gray-900">68%</span></div>
                             <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div><span className="text-[8px] font-bold text-gray-600">In Progress</span></div><span className="text-[8px] font-bold text-gray-900">24%</span></div>
                             <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div><span className="text-[8px] font-bold text-gray-600">To Do</span></div><span className="text-[8px] font-bold text-gray-900">8%</span></div>
                           </div>
                         </div>
                       </div>
                     </div>
                  </div>
                  </motion.div>
                </motion.div>

                {/* 3. Mobile Dashboard Panel */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="absolute top-[67px] right-[-2px] w-[174px] h-[496px] z-30"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                    className="w-full h-full bg-white rounded-[28px] shadow-[0_20px_50px_rgb(0,0,0,0.13)] border-[6px] border-gray-900 p-4 flex flex-col overflow-hidden"
                  >
                  {/* Mobile Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-[10px] z-10"></div>
                  
                  <div className="flex justify-between items-center mt-3 mb-5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-[4px] bg-[#8b5cf6] flex items-center justify-center"><span className="text-white text-[9px] font-bold">T</span></div>
                      <span className="font-extrabold text-gray-900 text-[11px]">Taskly</span>
                    </div>
                    <Menu size={14} className="text-gray-800" />
                  </div>
                  
                  <h2 className="font-extrabold text-[15px] text-gray-900 mb-0.5">Hello, James 👋</h2>
                  <p className="text-[9px] text-gray-400 mb-5 leading-tight">Here's what's happening with your projects today.</p>
                  
                  {/* Highlight Stat */}
                  <div className="border border-gray-100 rounded-xl p-3 mb-5 shadow-sm">
                    <div className="text-[8px] text-gray-400 font-bold mb-1">Tasks Completed</div>
                    <div className="text-[22px] font-black text-gray-900 mb-0.5 leading-none">68%</div>
                    <div className="text-[7px] text-[#20c997] font-bold">+8% this month</div>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="mb-5">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-bold text-gray-800">Project Overview</span>
                       <span className="text-[7px] text-gray-500 border border-gray-200 rounded px-1 flex items-center gap-0.5">This Week <ChevronDown size={8}/></span>
                     </div>
                     <div className="w-full h-[50px] relative">
                       <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                          <motion.path d="M 0 35 L 20 25 L 35 30 L 50 20 L 65 15 L 80 28 L 100 18" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 4" animate={{ strokeDashoffset: [8, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                          <motion.circle cx="0" cy="35" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" animate={{ r: [1.5, 2.5, 1.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.1 }} />
                          <motion.circle cx="20" cy="25" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" animate={{ r: [1.5, 2.5, 1.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
                          <motion.circle cx="35" cy="30" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" animate={{ r: [1.5, 2.5, 1.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
                          <circle cx="65" cy="15" r="2" fill="white" stroke="#20c997" strokeWidth="1.5" />
                          <motion.circle cx="80" cy="28" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" animate={{ r: [1.5, 2.5, 1.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                          <motion.circle cx="100" cy="18" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" animate={{ r: [1.5, 2.5, 1.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
                          <rect x="58" y="2" width="14" height="9" rx="3" fill="#20c997" />
                          <text x="65" y="8" fill="white" fontSize="5" fontWeight="bold" textAnchor="middle">68%</text>
                       </svg>
                     </div>
                  </div>
                  
                  {/* Mobile Recent Tasks */}
                  <div>
                     <span className="text-[9px] font-bold text-gray-800 block mb-2">Recent Tasks</span>
                     <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                         <span className="text-[8px] text-gray-600 font-medium">Design homepage</span>
                         <span className="text-[7px] text-[#20c997] font-bold">In Progress</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-[8px] text-gray-600 font-medium">API integration</span>
                         <span className="text-[7px] text-[#20c997] font-bold">In Progress</span>
                       </div>
                     </div>
                  </div>
                 </motion.div>
                </motion.div>
                
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Horizontal Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full bg-white rounded-3xl p-6 lg:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100"
        >
          {/* Feature 1 */}
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-[#22c55e]" />
            </motion.div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Lightning Fast</h4>
              <p className="text-[11px] text-gray-500">Generate complete UI<br className="hidden xl:block"/> in seconds.</p>
            </div>
          </div>
          {/* Feature 2 */}
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-10 h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center shrink-0">
              <LayoutGrid size={18} className="text-[#9333ea]" />
            </motion.div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Production Ready</h4>
              <p className="text-[11px] text-gray-500">Clean, consistent and<br className="hidden xl:block"/> ready to build.</p>
            </div>
          </div>
          {/* Feature 3 */}
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-10 h-10 rounded-full bg-[#ffedd5] flex items-center justify-center shrink-0">
              <Users size={18} className="text-[#f97316]" />
            </motion.div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">AI That Understands</h4>
              <p className="text-[11px] text-gray-500">Smarter prompts,<br className="hidden xl:block"/> better results.</p>
            </div>
          </div>
          {/* Feature 4 */}
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center shrink-0">
              <Cloud size={18} className="text-[#3b82f6]" />
            </motion.div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Loved by Designers</h4>
              <p className="text-[11px] text-gray-500">Trusted by 12,000+<br className="hidden xl:block"/> designers & teams.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ShowcaseSection;
