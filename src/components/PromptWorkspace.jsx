import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, LayoutTemplate, CheckSquare, Layers, 
  Heart, Briefcase, Plus, ChevronDown, Sparkles, Image as ImageIcon,
  ArrowRight, Info, ChevronUp, PanelRightClose, Minus, 
  Mic, Palette, MousePointerSquareDashed, Check,
  Grid, Droplet, Circle, Settings, Store, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PromptWorkspace = () => {
  const navigate = useNavigate();
  
  // State for Chat Flow
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [generationSteps, setGenerationSteps] = useState([]);
  
  const handleSubmit = () => {
    if (!chatInput.trim()) return;
    
    setHasGenerated(true);
    setIsGenerating(true);
    setGenerationSteps([]);
    
    // Simulate generation sequence
    const steps = [
      "Processing your request...",
      "Thinking about your request...",
      "Editing Home__desktop...",
      "Writing Home__mobile..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
         setGenerationSteps(prev => [...prev, steps[currentStep]]);
         currentStep++;
      } else {
         clearInterval(interval);
         setIsGenerating(false);
      }
    }, 1500); // Add a new step every 1.5 seconds
  };

  return (
    <div className="flex w-full h-screen bg-[#fafafa] font-sans overflow-hidden">
      
      {/* --- LEFT SIDEBAR (Unchanged from previous update) --- */}
      <div className="w-[260px] h-full bg-white border-r border-gray-100 flex flex-col py-6 px-5 flex-shrink-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded bg-[#6366f1] flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-extrabold text-[20px] tracking-tight text-gray-900">DesignDroid</span>
        </div>

        {/* New Design Button */}
        <button 
          onClick={() => {
            setHasGenerated(false);
            setGenerationSteps([]);
            setChatInput('');
          }}
          className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-8 shadow-sm shadow-[#6366f1]/20"
        >
          <Plus size={18} strokeWidth={2.5} /> New Design
        </button>

        {/* Navigation */}
        <div className="flex-1 space-y-1">
          <NavItem icon={<Store size={18} />} label="Design Market" />
          <NavItem icon={<Sparkles size={18} />} label="Generate Design" isActive />
          <NavItem icon={<History size={18} />} label="Past Designs" />
          <NavItem icon={<Heart size={18} />} label="Favourite" />
        </div>

        {/* Upgrade Card */}
        <div className="relative mt-auto rounded-2xl bg-[#e6fcf5] p-5 overflow-hidden border border-[#c3fae8]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800">Upgrade to Pro</h3>
              <Sparkles size={16} className="text-[#0ca678]" />
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Unlock unlimited generations, premium templates & more.
            </p>
            <button className="bg-gray-900 text-white text-xs font-bold py-2.5 px-5 rounded-full hover:bg-black transition-colors">
              Upgrade Now
            </button>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border-[1.5px] border-[#20c997]/20 flex items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-[#38d9a9] flex items-center justify-center relative shadow-inner">
               <div className="absolute w-8 h-8 rounded-full bg-gray-900 border-[3px] border-white -bottom-1 -left-1"></div>
               <ArrowRight size={24} className="text-gray-900 -rotate-45 ml-2 mb-2" strokeWidth={3} />
             </div>
          </div>
        </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Top Header */}
        <header className="h-[72px] w-full flex items-center justify-end px-10 border-b border-transparent z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <div className="w-2 h-2 rounded-full bg-[#38d9a9]"></div>
              20 Credits Left
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-sm">
                A
              </div>
              <span className="font-semibold text-sm text-gray-700">Aarav</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Dynamic Split Layout */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* CHAT THREAD (Left Column) */}
          <div 
            className={`flex flex-col h-full transition-all duration-700 ease-in-out custom-scrollbar bg-white ${
              hasGenerated ? 'w-[45%] border-r border-gray-100' : 'w-full overflow-y-auto'
            }`}
          >
            {/* Center Wrapper for Empty State */}
            <div className={`flex flex-col w-full mx-auto ${hasGenerated ? 'h-full' : 'max-w-4xl min-h-full pb-20 pt-8'}`}>
            {/* Thread Header */}
            <div className="px-8 py-4 flex items-center justify-between border-b border-gray-100">
               <h2 className="text-lg font-bold text-[#111]">New Thread</h2>
               <div className="flex items-center gap-3 text-gray-400">
                 <div className="flex flex-col items-center justify-center w-6 h-6 hover:bg-gray-100 rounded cursor-pointer">
                   <ChevronUp size={14} className="-mb-1" />
                   <ChevronDown size={14} />
                 </div>
                 <Plus size={18} className="cursor-pointer hover:text-gray-800" />
               </div>
            </div>

            {/* Message History */}
            <div className={`px-8 py-6 custom-scrollbar flex flex-col ${hasGenerated ? 'flex-1 overflow-y-auto' : 'flex-1'}`}>
               
               <AnimatePresence>
                 {hasGenerated && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="mb-8"
                   >
                     {/* User Message */}
                     <div className="bg-[#f0ede6] text-gray-800 p-4 rounded-xl text-sm font-medium leading-relaxed max-w-[85%] self-start rounded-tl-sm mb-6">
                       {chatInput}
                     </div>

                     {/* AI Generation Steps */}
                     <div className="space-y-3 pl-2">
                       {generationSteps.map((step, idx) => (
                         <motion.div 
                           key={idx}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="flex items-center gap-3 text-gray-600 text-sm font-medium"
                         >
                           <Check size={16} strokeWidth={3} className="text-gray-500" />
                           {step}
                         </motion.div>
                       ))}
                       
                       {isGenerating && (
                         <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex items-center gap-3 text-[#6366f1] text-sm font-medium mt-4"
                         >
                           <Sparkles size={16} className="animate-pulse" />
                           Generating...
                         </motion.div>
                       )}

                       {/* Completion State */}
                       {!isGenerating && generationSteps.length > 0 && (
                         <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="mt-6"
                         >
                           <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-4">
                             <Sparkles size={16} />
                             Worked for 12s <ChevronDown size={14} className="-rotate-90" />
                           </div>
                           
                           {/* Tiny Thumbnails */}
                           <div className="flex gap-4">
                             <div className="w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border border-gray-200 relative shadow-sm cursor-pointer hover:ring-2 hover:ring-[#6366f1] transition-all">
                                {/* Fake desktop thumbnail UI */}
                                <div className="absolute top-2 left-2 w-8 h-2 bg-white/20 rounded-full"></div>
                                <div className="absolute top-8 left-2 text-white text-[6px] font-bold">Your AI Co-Pilot<br/>for Mobile & Web</div>
                                <div className="absolute top-8 right-2 w-10 h-10 bg-white/10 rounded-sm"></div>
                             </div>
                             <div className="w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border border-gray-200 relative shadow-sm cursor-pointer hover:ring-2 hover:ring-[#6366f1] transition-all">
                                {/* Fake mobile thumbnail UI */}
                                <div className="absolute top-2 left-2 text-white text-[6px] font-bold">Design Droid</div>
                                <div className="absolute top-8 left-2 text-white text-[8px] font-bold">Your AI Co-Pilot<br/>for Mobile & Web</div>
                             </div>
                           </div>
                         </motion.div>
                       )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Chat Input Box */}
            <div className="px-8 pb-8 pt-4 bg-white relative z-10">
               <div className="border border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-xl bg-white focus-within:border-[#6366f1] focus-within:ring-1 focus-within:ring-[#6366f1]/20 transition-all flex flex-col">
                  
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Describe your design, @ to reference images or documents"
                    className="w-full min-h-[140px] p-6 text-[15px] text-gray-700 bg-transparent resize-none outline-none placeholder-gray-400"
                    disabled={isGenerating}
                  />

                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
                    <div className="flex items-center gap-4 text-gray-500">
                      <button className="hover:text-gray-800 transition-colors"><Plus size={18} /></button>
                      <button className="hover:text-gray-800 transition-colors"><MousePointerSquareDashed size={18} /></button>
                      <button className="hover:text-gray-800 transition-colors"><Palette size={18} /></button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors">
                        Glide <ChevronDown size={14} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Mic size={18} />
                      </button>
                    </div>
                  </div>

               </div>
               
               {/* Design Preferences */}
               <div className="mt-10 px-8">
                 <h3 className="font-bold text-gray-800 mb-5 text-sm">Design Preferences</h3>
                 <div className="grid grid-cols-3 gap-5 mb-5">
                   <SelectBox icon={<Grid size={16} className="text-white" />} iconBg="bg-[#6366f1]" label="Style" value="Modern" />
                   <SelectBox icon={<Droplet size={16} className="text-white" />} iconBg="bg-[#20c997]" label="Primary Color" value="Nunito Green" />
                   <SelectBox icon={<Circle size={16} className="text-white" />} iconBg="bg-[#6366f1]" label="Tone" value="Professional" />
                 </div>
                 <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors ml-1">
                   <Settings size={14} /> Advanced Settings <ChevronDown size={12} />
                 </button>
               </div>

               {/* Your Past Designs */}
               {!hasGenerated && (
                 <div className="mt-20 px-8 pb-10 w-full border-t border-gray-100 pt-12">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="font-bold text-gray-800 text-lg">Your Past Designs</h3>
                     <button className="text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors">View All</button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                     {/* Design Card 1 */}
                     <div className="group cursor-pointer">
                       <div className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-200 relative group-hover:border-[#6366f1] group-hover:shadow-md transition-all">
                          <div className="absolute top-0 left-0 w-full h-8 bg-white border-b border-gray-100 flex items-center px-3 gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div><div className="w-2 h-2 rounded-full bg-yellow-400"></div><div className="w-2 h-2 rounded-full bg-green-400"></div>
                          </div>
                          <div className="absolute top-12 left-4 w-1/3 h-4 bg-gray-200 rounded"></div>
                          <div className="absolute top-20 left-4 right-4 h-16 bg-white border border-gray-100 rounded-lg shadow-sm"></div>
                       </div>
                       <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#6366f1] transition-colors">SaaS Dashboard</h4>
                       <p className="text-xs text-gray-500 mt-1">Generated 2 days ago</p>
                     </div>

                     {/* Design Card 2 */}
                     <div className="group cursor-pointer">
                       <div className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-200 relative group-hover:border-[#6366f1] group-hover:shadow-md transition-all">
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-32 bg-white border-4 border-gray-200 rounded-xl shadow-sm">
                            <div className="w-full h-12 bg-[#8b5cf6] rounded-t-md"></div>
                            <div className="w-10 h-2 bg-gray-100 rounded mt-2 mx-auto"></div>
                          </div>
                       </div>
                       <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#6366f1] transition-colors">Mobile Fitness App</h4>
                       <p className="text-xs text-gray-500 mt-1">Generated 5 days ago</p>
                     </div>
                     
                     {/* Design Card 3 */}
                     <div className="group cursor-pointer">
                       <div className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-200 relative group-hover:border-[#6366f1] group-hover:shadow-md transition-all flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-[#6366f1]/30 group-hover:text-[#6366f1] transition-colors">
                            <Plus size={32} />
                          </div>
                       </div>
                       <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#6366f1] transition-colors">Generate New</h4>
                       <p className="text-xs text-gray-500 mt-1">Start a blank canvas</p>
                     </div>
                   </div>
                 </div>
               )}

            </div>
            </div>

          </div>

          {/* PREVIEW CANVAS (Right Column) */}
          <AnimatePresence>
            {hasGenerated && (
              <motion.div 
                initial={{ opacity: 0, x: 50, width: 0 }}
                animate={{ opacity: 1, x: 0, width: '55%' }}
                className="h-full bg-[#f8f9fa] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] relative border-l border-gray-200 overflow-hidden"
              >
                
                {/* Canvas Controls */}
                <div className="absolute top-4 left-4 z-20">
                  <button className="w-8 h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50">
                    <PanelRightClose size={16} />
                  </button>
                </div>

                <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm text-sm font-bold text-gray-700">
                  <button className="hover:text-gray-900"><Minus size={14} /></button>
                  <span className="w-10 text-center">42%</span>
                  <button className="hover:text-gray-900"><Plus size={14} /></button>
                </div>

                {/* Canvas Content (The Mockup) */}
                <div className="w-full h-full flex items-center justify-center p-12">
                   {!isGenerating ? (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 0.3 }}
                       className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden relative"
                     >
                       {/* Desktop Header */}
                       <div className="h-12 border-b border-gray-100 flex items-center px-6 justify-between bg-white">
                          <div className="font-extrabold text-sm text-gray-900">Taskly</div>
                          <div className="flex gap-4 text-[10px] font-bold text-gray-500">
                            <span>Product</span><span>Features</span><span>Pricing</span>
                          </div>
                          <button className="bg-[#6366f1] text-white px-3 py-1 rounded text-[10px] font-bold">Sign up</button>
                       </div>
                       
                       {/* Desktop Body */}
                       <div className="p-8 pb-16 flex relative">
                          <div className="w-1/2">
                            <h1 className="text-4xl font-extrabold leading-tight text-gray-900 mb-4">
                              Work smarter,<br/>faster
                            </h1>
                            <p className="text-gray-500 text-xs mb-6 max-w-xs">
                              Taskly helps teams plan, collaborate and get more done.
                            </p>
                            <button className="bg-[#6366f1] text-white text-xs font-bold px-4 py-2 rounded-full">Get Started Free</button>
                          </div>
                          <div className="w-1/2 relative">
                             <div className="absolute top-0 right-0 w-48 h-64 bg-[#8b5cf6] rounded-2xl"></div>
                             <div className="absolute top-10 right-10 w-40 h-32 bg-white rounded-xl shadow-lg border border-gray-100 p-3">
                               <div className="w-full h-10 bg-gray-50 rounded mb-2"></div>
                               <div className="w-full h-10 bg-gray-50 rounded"></div>
                             </div>
                          </div>
                       </div>

                       {/* Mobile Overlap */}
                       <div className="absolute bottom-[-20px] left-[50%] -translate-x-[50%] w-[160px] h-[300px] bg-white rounded-[20px] shadow-2xl border-[4px] border-gray-100 overflow-hidden flex flex-col z-20">
                         <div className="px-3 py-2 flex items-center justify-between border-b border-gray-50">
                            <span className="font-extrabold text-[8px] text-gray-900">Taskly</span>
                            <div className="w-3 h-3 bg-gray-100 rounded"></div>
                         </div>
                         <div className="p-3 flex-1">
                            <h1 className="text-sm font-extrabold leading-tight text-gray-900 mb-2">Work smarter, faster</h1>
                            <p className="text-gray-500 text-[6px] mb-3">Taskly helps teams plan, collaborate.</p>
                            <button className="w-full bg-[#6366f1] text-white text-[8px] font-bold py-1.5 rounded-full mb-2">Get Started Free</button>
                            <div className="w-full h-24 bg-[#8b5cf6] rounded-lg mt-2"></div>
                         </div>
                       </div>
                     </motion.div>
                   ) : (
                     <div className="text-center text-gray-400 font-medium animate-pulse">
                       Generating interface on canvas...
                     </div>
                   )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, isActive }) => (
  <button 
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
      isActive 
        ? 'bg-[#f0f1fa] text-[#6366f1]' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <div className={`flex items-center justify-center ${isActive ? 'text-[#6366f1]' : 'text-gray-500'}`}>
      {isActive && label === 'Generate Design' ? (
         <div className="relative">
           {icon}
           <div className="absolute -top-1 -right-1 bg-[#6366f1] text-white rounded-full p-[1px]">
             <Check size={8} strokeWidth={4} />
           </div>
         </div>
      ) : icon}
    </div>
    {label}
  </button>
);

const SelectBox = ({ icon, iconBg, label, value }) => (
  <button className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm transition-all text-left w-full">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold text-gray-800 flex items-center justify-between gap-1 w-full">
        {value} <ChevronDown size={12} className="text-gray-400 mt-0.5" />
      </span>
    </div>
  </button>
);

export default PromptWorkspace;
