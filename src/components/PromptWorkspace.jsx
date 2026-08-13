import React, { useEffect, useRef, useState } from 'react';
import {
  Heart, Plus, ChevronDown, Sparkles,
  ArrowRight, ChevronUp,
  Mic, Palette, MousePointerSquareDashed, Check,
  Grid, Droplet, Circle, Settings, Store, History, X, SlidersHorizontal, Loader2,
  Upload, LogOut, Monitor, Smartphone, PanelRightClose
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api, errorMsg } from '../lib/api.js';
import { useAuth } from '../context/useAuth.js';
import { modelLabel } from '../lib/modelLabel.js';

const STATUS_STYLES = {
  pending: 'bg-gray-100 text-gray-600',
  planning: 'bg-amber-50 text-amber-700',
  images_generating: 'bg-sky-50 text-sky-700',
  designing: 'bg-violet-50 text-violet-700',
  ready: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
};

const STYLES = ['Modern', 'Minimal', 'Bold', 'Elegant', 'Playful'];
const COLORS = ['Nunito Green', 'Royal Blue', 'Sunset Orange', 'Rose Pink', 'Deep Purple'];
const TONES = ['Professional', 'Friendly', 'Luxury', 'Technical'];

const PromptWorkspace = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State for Chat Flow
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [platform, setPlatform] = useState('web');

  // Design preferences (real selectable values)
  const [style, setStyle] = useState('Modern');
  const [color, setColor] = useState('Nunito Green');
  const [tone, setTone] = useState('Professional');

  // Real model catalog
  const [models, setModels] = useState({ text: [], image: [], design: [], multimodal: [] });
  const [selected, setSelected] = useState({ textModel: 'default', imageModel: 'default', designModel: 'default' });
  const [showModels, setShowModels] = useState(false);
  const [modelsPos, setModelsPos] = useState(null);
  const modelsBtnRef = useRef(null);

  const toggleModels = () => {
    if (!showModels && modelsBtnRef.current) {
      const rect = modelsBtnRef.current.getBoundingClientRect();
      setModelsPos({
        left: rect.right - 400,
        bottom: window.innerHeight - rect.top + 12,
      });
    }
    setShowModels((v) => !v);
  };

  // Real past designs
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/models', { params: { category: 'text' } }),
      api.get('/models', { params: { category: 'image' } }),
      api.get('/models', { params: { category: 'design' } }),
      api.get('/models', { params: { category: 'multimodal' } }),
    ])
      .then(([text, image, design, multimodal]) => {
        setModels({
          text: text.data.models,
          image: image.data.models,
          design: design.data.models,
          multimodal: multimodal.data.models,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setProjectsLoading(true);
    api.get('/projects')
      .then(({ data }) => setProjects(data.projects))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, [user]);

  const MODEL_ROWS = [
    { key: 'textModel', label: 'Text / planning model', options: [...models.text, ...models.multimodal] },
    { key: 'imageModel', label: 'Image model', options: models.image },
    { key: 'designModel', label: 'UI/UX design model', options: [...models.design, ...models.multimodal] },
  ];

  const handleSubmit = async () => {
    if (!chatInput.trim() || isGenerating) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    setGenerationError('');
    setHasGenerated(true);
    setIsGenerating(true);

    try {
      const modelsPayload = Object.fromEntries(
        Object.entries(selected).filter(([, v]) => v !== 'default')
      );
      const { data } = await api.post('/projects', {
        prompt: chatInput.trim(),
        platform,
        models: modelsPayload,
      });
      navigate(`/design/projects/${data.project._id}`);
    } catch (err) {
      setGenerationError(errorMsg(err));
      setIsGenerating(false);
    }
  };

  const openPreference = (list, current, setter) => {
    const next = (list.indexOf(current) + 1) % list.length;
    setter(list[next]);
  };

  return (
    <div className="flex w-full h-screen bg-[#fafafa] font-sans overflow-hidden">

      {/* --- LEFT SIDEBAR --- */}
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
            setGenerationError('');
            setChatInput('');
          }}
          className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-8 shadow-sm shadow-[#6366f1]/20"
        >
          <Plus size={18} strokeWidth={2.5} /> New Design
        </button>

        {/* Navigation */}
        <div className="flex-1 space-y-1">
          <NavItem icon={<Store size={18} />} label="Design Market" onClick={() => navigate('/design/uploads')} />
          <NavItem icon={<Sparkles size={18} />} label="Generate Design" isActive />
          <NavItem icon={<History size={18} />} label="Past Designs" onClick={() => document.getElementById('past-designs')?.scrollIntoView({ behavior: 'smooth' })} />
          <NavItem icon={<Heart size={18} />} label="Favourite" />
          <NavItem icon={<Upload size={18} />} label="Upload Design" onClick={() => navigate('/design/uploads')} />
          <NavItem icon={<Settings size={18} />} label="Settings" onClick={() => navigate('/design/settings')} />
        </div>

        {/* User + Upgrade Card */}
        <div className="mt-auto space-y-4">
          {user && (
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
          <div className="relative rounded-2xl bg-[#e6fcf5] p-5 overflow-hidden border border-[#c3fae8]">
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
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border-[1.5px] border-[#20c997]/20 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#38d9a9] flex items-center justify-center relative shadow-inner">
                <div className="absolute w-8 h-8 rounded-full bg-gray-900 border-[3px] border-white -bottom-1 -left-1"></div>
                <ArrowRight size={24} className="text-gray-900 -rotate-45 ml-2 mb-2" strokeWidth={3} />
              </div>
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
              {user ? `${user.creditsRemaining ?? 20} Credits Left` : 'Not signed in'}
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-sm">
                {user ? (user.name || 'U')[0].toUpperCase() : 'G'}
              </div>
              <span className="font-semibold text-sm text-gray-700">{user ? user.name : 'Guest'}</span>
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

                     {/* Live generation state */}
                     <div className="space-y-3 pl-2">
                       {isGenerating && (
                         <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex items-center gap-3 text-[#6366f1] text-sm font-medium mt-4"
                         >
                           <Loader2 size={16} className="animate-spin" />
                           Creating project & starting pipeline...
                         </motion.div>
                       )}

                       {generationError && (
                         <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="rounded-xl bg-red-50 text-red-600 text-sm font-medium p-4"
                         >
                           {generationError}
                         </motion.div>
                       )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Chat Input Box */}
            <div className="px-8 pb-8 pt-4 bg-white relative z-10">
               <div className="relative">
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
                      {/* Platform selector */}
                      <div className="flex items-center gap-1 rounded-lg bg-gray-50 border border-gray-200 p-1">
                        <button
                          onClick={() => setPlatform('web')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                            platform === 'web' ? 'bg-white text-[#6366f1] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Monitor size={13} /> Web
                        </button>
                        <button
                          onClick={() => setPlatform('android')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                            platform === 'android' ? 'bg-white text-[#6366f1] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Smartphone size={13} /> Android
                        </button>
                        <button
                          onClick={() => setPlatform('windows')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                            platform === 'windows' ? 'bg-white text-[#6366f1] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <PanelRightClose size={13} /> Windows
                        </button>
                      </div>
                      <button
                        ref={modelsBtnRef}
                        onClick={toggleModels}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                          showModels ? 'text-[#4f46e5]' : 'text-[#6366f1] hover:text-[#4f46e5]'
                        }`}
                      >
                        <SlidersHorizontal size={15} />
                        Models <ChevronDown size={14} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Mic size={18} />
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isGenerating || !chatInput.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-bold text-white hover:bg-[#4f46e5] transition-colors disabled:opacity-50 disabled:hover:bg-[#6366f1]"
                      >
                        {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                        {isGenerating ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  </div>

               </div>

               {/* MODEL SELECTION DROPDOWN — opens upward from Models button, fixed (never clipped) */}
               <AnimatePresence>
                 {showModels && modelsPos && (
                   <motion.div
                     initial={{ opacity: 0, y: 8 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 8 }}
                     transition={{ duration: 0.18 }}
                     style={{
                       left: Math.max(16, modelsPos.left),
                       bottom: modelsPos.bottom,
                       width: 400,
                       maxWidth: 'calc(100vw - 32px)',
                     }}
                     className="fixed z-50 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_20px_60px_rgba(16,24,40,.18)]"
                   >
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <h3 className="font-extrabold text-gray-900 text-sm">Model selection</h3>
                         <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                           🟢 free / 🟡 quota-tier · applies to your next generation
                         </p>
                       </div>
                       <button onClick={() => setShowModels(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                         <X size={18} />
                       </button>
                     </div>
                     <div className="space-y-3">
                       {MODEL_ROWS.map((row) => (
                         <label key={row.key} className="block">
                           <span className="text-xs font-semibold text-gray-600">{row.label} ({row.options.length} models)</span>
                           <select
                             value={selected[row.key]}
                             onChange={(e) => setSelected((prev) => ({ ...prev, [row.key]: e.target.value }))}
                             className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-[#6366f1]"
                           >
                             <option value="default">System default</option>
                             {row.options.map((m) => (
                               <option key={m.modelId} value={m.modelId}>
                                 {modelLabel(m)} · ${m.costPerUnit}/unit · ~{m.avgLatencyMs}ms
                               </option>
                             ))}
                           </select>
                         </label>
                       ))}
                     </div>
                     <p className="mt-3 text-[11px] text-gray-400 font-medium">
                       Tip: pick one multimodal model in all three slots to use it everywhere.
                     </p>
                   </motion.div>
                 )}
               </AnimatePresence>
               </div>

               {/* Design Preferences */}
               <div className="mt-10 px-8">
                 <h3 className="font-bold text-gray-800 mb-5 text-sm">Design Preferences</h3>
                 <div className="grid grid-cols-3 gap-5 mb-5">
                   <SelectBox
                     icon={<Grid size={16} className="text-white" />}
                     iconBg="bg-[#6366f1]"
                     label="Style"
                     value={style}
                     onClick={() => openPreference(STYLES, style, setStyle)}
                   />
                   <SelectBox
                     icon={<Droplet size={16} className="text-white" />}
                     iconBg="bg-[#20c997]"
                     label="Primary Color"
                     value={color}
                     onClick={() => openPreference(COLORS, color, setColor)}
                   />
                   <SelectBox
                     icon={<Circle size={16} className="text-white" />}
                     iconBg="bg-[#6366f1]"
                     label="Tone"
                     value={tone}
                     onClick={() => openPreference(TONES, tone, setTone)}
                   />
                 </div>
                 <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors ml-1">
                   <Settings size={14} /> Advanced Settings <ChevronDown size={12} />
                 </button>
               </div>

               {/* Your Past Designs — REAL data */}
               {!hasGenerated && (
                 <div id="past-designs" className="mt-20 px-8 pb-10 w-full border-t border-gray-100 pt-12">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="font-bold text-gray-800 text-lg">Your Past Designs</h3>
                     <button className="text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors">
                       View All
                     </button>
                   </div>

                   {!user ? (
                     <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                       <p className="text-sm text-[#98A2B3] mb-4">Sign in to see your past designs</p>
                       <button
                         onClick={() => navigate('/auth')}
                         className="bg-[#6366f1] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#4f46e5] transition-colors"
                       >
                         Sign in
                       </button>
                     </div>
                   ) : projectsLoading ? (
                     <div className="grid grid-cols-2 gap-6">
                       {[1, 2].map((i) => (
                         <div key={i} className="w-full h-40 bg-gray-100 rounded-2xl animate-pulse" />
                       ))}
                     </div>
                   ) : projects.length === 0 ? (
                     <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-[#98A2B3]">
                       No projects yet — describe a design above to create your first one.
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 gap-6">
                       {projects.slice(0, 6).map((p) => (
                         <div key={p._id} className="group cursor-pointer" onClick={() => navigate(`/design/projects/${p._id}`)}>
                           <div className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-200 relative group-hover:border-[#6366f1] group-hover:shadow-md transition-all">
                             <div className="absolute top-0 left-0 w-full h-8 bg-white border-b border-gray-100 flex items-center px-3 gap-2">
                               <div className="w-2 h-2 rounded-full bg-red-400"></div><div className="w-2 h-2 rounded-full bg-yellow-400"></div><div className="w-2 h-2 rounded-full bg-green-400"></div>
                             </div>
                             <div className="absolute top-12 left-4 w-1/3 h-4 bg-gray-200 rounded"></div>
                             <div className="absolute top-20 left-4 right-4 h-16 bg-white border border-gray-100 rounded-lg shadow-sm"></div>
                             <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}>
                               {p.status.replace('_', ' ')}
                             </span>
                           </div>
                           <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#6366f1] transition-colors line-clamp-1">{p.prompt}</h4>
                           <p className="text-xs text-gray-500 mt-1">
                             {new Date(p.createdAt).toLocaleDateString()} · {p.platform}
                             {p.plan?.sections ? ` · ${p.plan.sections.length} sections` : ''}
                           </p>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}

            </div>
            </div>

          </div>

          {/* PREVIEW CANVAS (Right Column) */}
          <AnimatePresence>
            {hasGenerated && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, x: 50, width: 0 }}
                animate={{ opacity: 1, x: 0, width: '55%' }}
                className="h-full bg-[#f8f9fa] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] relative border-l border-gray-200 overflow-hidden"
              >
                <div className="w-full h-full flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-600 mb-2">
                      {generationError ? 'Generation failed' : 'Project created'}
                    </div>
                    <p className="text-xs text-gray-400">
                      {generationError
                        ? 'Fix the prompt or your model selection and try again.'
                        : 'Opening the studio...'}
                    </p>
                  </div>
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
const NavItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
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

const SelectBox = ({ icon, iconBg, label, value, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm transition-all text-left w-full">
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
