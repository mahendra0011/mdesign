import React, { useEffect, useRef, useState } from 'react';
import {
  Heart, Plus, ChevronDown, Sparkles,
  ArrowRight, ChevronUp,
  Palette, MousePointerSquareDashed, Check,
  Grid, Droplet, Circle, Settings, Store, History, X, SlidersHorizontal, Loader2,
  Upload, LogOut, Monitor, Smartphone, PanelRightClose, Send, ShieldCheck, Pencil, LayoutTemplate, ImageIcon, Wrench, PartyPopper, MessageSquare, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api, errorMsg } from '../lib/api.js';
import { useAuth } from '../context/useAuth.js';
import { modelLabel } from '../lib/modelLabel.js';
import { connectSocket } from '../lib/socket.js';
import { attachPuterBridge } from '../lib/puterBridge.js';
import DesignCanvas from './studio/DesignCanvas.jsx';

const STATUS_STYLES = {
  pending: 'bg-gray-100 text-gray-600',
  planning: 'bg-amber-50 text-amber-700',
  awaiting_approval: 'bg-indigo-50 text-indigo-700',
  images_generating: 'bg-sky-50 text-sky-700',
  designing: 'bg-violet-50 text-violet-700',
  ready: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
};

const STYLES = ['Modern', 'Minimal', 'Bold', 'Elegant', 'Playful'];
const COLORS = ['Nunito Green', 'Royal Blue', 'Sunset Orange', 'Rose Pink', 'Deep Purple'];
const TONES = ['Professional', 'Friendly', 'Luxury', 'Technical'];

const PHASE_STEPS = [
  { id: 'planning', label: 'Plan' },
  { id: 'images_generating', label: 'Mockups' },
  { id: 'designing', label: 'Design build' },
  { id: 'ready', label: 'Ready' },
];

function phaseIndex(phase) {
  const map = { pending: -1, planning: 0, awaiting_approval: 0, images_generating: 1, designing: 2, ready: 3, failed: 3 };
  return map[phase] ?? -1;
}

let uid = 0;
const nextId = () => `m${++uid}`;

const PromptWorkspace = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Chat thread — real AI conversation
  const [thread, setThread] = useState([]);
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

  // Live build state
  const [project, setProject] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [tree, setTree] = useState(null);
  const [builtIds, setBuiltIds] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [buildingId, setBuildingId] = useState(null);
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeInput, setChangeInput] = useState('');
  const imageMapRef = useRef(new Map());
  const builtIdsRef = useRef(new Set());
  const planRevRef = useRef(0);
  const messagesRef = useRef(null);

  const token = localStorage.getItem('mdesign_token');

  const push = (...items) => setThread((t) => [...t, ...items]);
  const pushUser = (text) => push({ id: nextId(), role: 'user', text });
  const pushAi = (text) => push({ id: nextId(), role: 'ai', text });

  const upsertStatus = (key, factory) => {
    setThread((t) => {
      const copy = [...t];
      const idx = copy.findIndex((item) => item.role === 'ai' && item.statusKey === key);
      const item = factory();
      if (idx === -1) return [...copy, item];
      copy[idx] = item;
      return copy;
    });
  };

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

  // Auto-scroll chat to newest message
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread]);

  // Socket listeners for the live build of the current project
  useEffect(() => {
    if (!project?._id || !token) return;
    const socket = connectSocket(token);
    socket.emit('join_project', { projectId: project._id });
    attachPuterBridge(socket);

    const onPipeline = ({ status, totalImages }) => {
      setPhase(status);
      if (status === 'images_generating' && totalImages) {
        upsertStatus('images', () => ({
          id: nextId(),
          role: 'ai',
          statusKey: 'images',
          images: [],
          total: totalImages,
          done: 0,
          text: `Generating ${totalImages} section mockups in parallel…`,
        }));
      }
      if (status === 'designing') {
        upsertStatus('designing', () => ({
          id: nextId(), role: 'ai', statusKey: 'designing', text: 'Building your design — watch it come together on the right.',
        }));
      }
    };
    const onPlan = ({ plan: p }) => {
      const count = p?.sections?.length || 0;
      planRevRef.current += 1;
      const revNo = planRevRef.current;
      setPhase('awaiting_approval');
      // Build a conversational section breakdown
      const sectionList = (p?.sections || [])
        .slice(0, 12)
        .map((s) => `${s.order}. **${s.name}** — ${s.layout_intent || 'section layout'}`)
        .join('\n');
      const introText = `Here's my plan for your ${p?.platform || platform} page — **${count} sections**. Here's what I'm thinking:\n\n${sectionList}\n\nStyle: ${p?.style_mood || '—'} · Colors: ${p?.color_direction || '—'} · Font: ${p?.font_direction || '—'}\n\nTake a look, and tell me anything you'd like to change — you can ask me to add, remove, or reorder sections, or switch the theme (e.g. "make it dark" or "add a reviews section"):`;
      // replace trailing planning status with the AI response + plan card
      setThread((t) => {
        const copy = [...t];
        // remove trailing planning status (spinner)
        const lastStatus = copy.findIndex((i) => i.role === 'ai' && i.statusKey === 'planning');
        if (lastStatus !== -1) copy.splice(lastStatus, 1);
        // remove previous plan card so the latest plan replaces it
        for (let i = copy.length - 1; i >= 0; i -= 1) {
          if (copy[i].role === 'ai' && copy[i].plan) {
            copy.splice(i, 1);
            break;
          }
        }
        return [
          ...copy,
          { id: nextId(), role: 'ai', text: introText },
          { id: nextId(), role: 'ai', plan: p, planCount: revNo },
        ];
      });
    };
    const onImage = ({ index, total, status, url, sectionId }) => {
      imageMapRef.current.set(index, { index, total, status, url, sectionId });
      const sorted = Array.from(imageMapRef.current.values()).sort((a, b) => a.index - b.index);
      const done = sorted.filter((i) => i.status === 'done').length;
      upsertStatus('images', () => ({
        id: nextId(),
        role: 'ai',
        statusKey: 'images',
        images: sorted,
        total,
        done,
        text: status === 'failed'
          ? `Mockup ${index + 1}/${total} failed — using a placeholder instead.`
          : done >= total ? 'All mockups ready!' : `${done}/${total} mockups done…`,
      }));
    };
    const onCursor = ({ x_pct, y_pct, clicking, component_id }) =>
      setCursor({ x_pct, y_pct, clicking, component_id });
    const onBuildStart = ({ component_id }) => {
      setBuildingId(component_id);
      builtIdsRef.current = new Set(builtIdsRef.current);
    };
    const onBuildDone = ({ component_id }) => {
      builtIdsRef.current.add(component_id);
      setBuiltIds(new Set(builtIdsRef.current));
      setBuildingId(null);
    };
    const onSectionDone = () => setCursor(null);
    const onDesignComplete = () => setPhase('ready');
    const onDesignReady = ({ versionNo, designJson }) => {
      setTree(designJson);
      setPhase('ready');
      setBuiltIds(null);
      upsertStatus('ready', () => ({
        id: nextId(), role: 'ai', statusKey: 'ready', text: `Your design is ready — version ${versionNo}. Open the full studio to customize & export.`,
      }));
    };
    const onFailed = ({ message }) => {
      setPhase('failed');
      upsertStatus('failed', () => ({
        id: nextId(), role: 'ai', statusKey: 'failed', text: message || 'Something went wrong during the build. Start over?',
      }));
    };
    const onNotice = ({ message }) =>
      upsertStatus('notice', () => ({ id: nextId(), role: 'ai', statusKey: 'notice', text: message }));

    socket.on('pipeline_status', onPipeline);
    socket.on('plan_ready', onPlan);
    socket.on('image_status', onImage);
    socket.on('cursor_move', onCursor);
    socket.on('component_build_start', onBuildStart);
    socket.on('component_build_done', onBuildDone);
    socket.on('section_done', onSectionDone);
    socket.on('design_complete', onDesignComplete);
    socket.on('design_ready', onDesignReady);
    socket.on('job_failed', onFailed);
    socket.on('pipeline_notice', onNotice);

    return () => {
      socket.off('pipeline_status', onPipeline);
      socket.off('plan_ready', onPlan);
      socket.off('image_status', onImage);
      socket.off('cursor_move', onCursor);
      socket.off('component_build_start', onBuildStart);
      socket.off('component_build_done', onBuildDone);
      socket.off('section_done', onSectionDone);
      socket.off('design_complete', onDesignComplete);
      socket.off('design_ready', onDesignReady);
      socket.off('job_failed', onFailed);
      socket.off('pipeline_notice', onNotice);
    };
  }, [project?._id, token, platform]);

  const MODEL_ROWS = [
    { key: 'textModel', label: 'Text / planning model', options: [...models.text, ...models.multimodal] },
    { key: 'imageModel', label: 'Image model', options: models.image },
    { key: 'designModel', label: 'UI/UX design model', options: [...models.design, ...models.multimodal] },
  ];

  const resetAll = () => {
    setThread([]);
    setChatInput('');
    setProject(null);
    setPhase('idle');
    setTree(null);
    setBuiltIds(null);
    setCursor(null);
    setBuildingId(null);
    setChangeOpen(false);
    setChangeInput('');
    imageMapRef.current = new Map();
    builtIdsRef.current = new Set();
    planRevRef.current = 0;
  };

  // Send a plan revision request
  const submitRevision = async (instruction) => {
    if (!project || phase !== 'awaiting_approval') return;
    pushUser(instruction);
    pushAi('Got it — revising the plan with your changes…');
    upsertStatus('planning', () => ({ id: nextId(), role: 'ai', statusKey: 'planning', text: 'Re-planning…' }));
    setPhase('planning');
    try {
      await api.post(`/projects/${project._id}/plan/replan`, { instruction });
    } catch (err) {
      setPhase('failed');
      upsertStatus('failed', () => ({ id: nextId(), role: 'ai', statusKey: 'failed', text: errorMsg(err) }));
    }
  };

  // First submission — creates the project
  const handleSubmit = async () => {
    if (!chatInput.trim() || phase === 'pending' || phase === 'planning' || phase === 'images_generating' || phase === 'designing') return;

    if (!user) {
      navigate('/auth');
      return;
    }

    const prompt = chatInput.trim();
    setChatInput('');

    if (phase === 'awaiting_approval') {
      // user typed a follow-up — treat as plan revision
      await submitRevision(prompt);
      return;
    }

    pushUser(prompt);
    pushAi('On it! Let me analyze your request and plan out the sections for this page.');
    upsertStatus('planning', () => ({ id: nextId(), role: 'ai', statusKey: 'planning', text: 'Planning your design…' }));

    try {
      const modelsPayload = Object.fromEntries(
        Object.entries(selected).filter(([, v]) => v !== 'default')
      );
      const { data } = await api.post('/projects', {
        prompt,
        platform,
        models: modelsPayload,
      });
      setProject(data.project);
      setPhase(data.project.status);
    } catch (err) {
      upsertStatus('failed', () => ({ id: nextId(), role: 'ai', statusKey: 'failed', text: errorMsg(err) }));
    }
  };

  const approvePlan = async () => {
    if (!project || phase !== 'awaiting_approval') return;
    pushAi('Awesome! Approving the plan — generating section mockups now…');
    upsertStatus('images', () => ({ id: nextId(), role: 'ai', statusKey: 'images', images: [], total: 0, done: 0, text: 'Generating section mockups…' }));
    setPhase('images_generating');
    setChangeOpen(false);
    try {
      await api.post(`/projects/${project._id}/plan/approve`);
    } catch (err) {
      upsertStatus('failed', () => ({ id: nextId(), role: 'ai', statusKey: 'failed', text: errorMsg(err) }));
    }
  };

  const openPreference = (list, current, setter) => {
    const next = (list.indexOf(current) + 1) % list.length;
    setter(list[next]);
  };

  const toggleFavourite = async (projectId, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/projects/${projectId}/favourite`);
      setProjects((prev) => prev.map((p) => (p._id === projectId ? { ...p, favourite: !p.favourite } : p)));
    } catch {
      /* silently ignore */
    }
  };

  const stepIdx = phaseIndex(phase);
  const hasGenerated = thread.length > 0;

  const renderStatus = (item) => {
    switch (item.statusKey) {
      case 'planning':
        return (
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex gap-1">
              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }} className="h-2 w-2 rounded-full bg-amber-400" />
              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="h-2 w-2 rounded-full bg-amber-400" />
              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="h-2 w-2 rounded-full bg-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{item.text || 'Planning your design…'}</p>
              <p className="text-xs text-gray-400 mt-0.5">Deciding sections, components & layout for your page.</p>
            </div>
          </div>
        );
      case 'images':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={15} className="text-sky-600" />
              <p className="text-sm font-bold text-gray-800">{item.text}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {item.images.length > 0 ? item.images.map((img) => (
                <div key={img.index} className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {img.status === 'done' && img.url ? (
                    <img src={img.url} alt={img.sectionId || `mockup ${img.index + 1}`} className="h-full w-full object-cover" />
                  ) : img.status === 'failed' ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50">
                      <span className="text-[9px] font-bold text-red-400">failed</span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 animate-pulse">
                      <Loader2 size={14} className="animate-spin text-gray-300" />
                    </div>
                  )}
                </div>
              )) : (
                Array.from({ length: item.total || 3 }).map((_, i) => (
                  <div key={i} className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-50 animate-pulse flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin text-gray-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'designing':
        return (
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <Wrench size={16} className="text-violet-600" />
            <div>
              <p className="text-sm font-bold text-gray-800">Building your design…</p>
              <p className="text-xs text-gray-400 mt-0.5">Watch it come together live in the design area on the right.</p>
            </div>
          </div>
        );
      case 'ready':
        return (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <PartyPopper size={15} className="text-emerald-600" />
              <p className="text-sm font-bold text-gray-900">Design ready!</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">{item.text}</p>
            {project && (
              <button
                onClick={() => navigate(`/design/projects/${project._id}`)}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
              >
                Open full studio <ArrowRight size={13} />
              </button>
            )}
          </div>
        );
      case 'failed':
        return (
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
            <p className="text-sm font-bold text-red-700">Something went wrong</p>
            <p className="text-xs text-red-500 mt-1">{item.text || 'The pipeline failed.'}</p>
            <button onClick={resetAll} className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors">
              Start over
            </button>
          </div>
        );
      case 'notice':
        return (
          <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            <p className="text-xs font-medium text-amber-700">{item.text}</p>
          </div>
        );
      default:
        return null;
    }
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
          onClick={resetAll}
          className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-8 shadow-sm shadow-[#6366f1]/20"
        >
          <Plus size={18} strokeWidth={2.5} /> New Design
        </button>

        {/* Navigation */}
        <div className="flex-1 space-y-1">
          <NavItem icon={<Store size={18} />} label="Design Market" onClick={() => navigate('/design/uploads')} />
          <NavItem icon={<Sparkles size={18} />} label="Generate Design" isActive />
          <NavItem icon={<History size={18} />} label="Past Designs" onClick={() => document.getElementById('past-designs')?.scrollIntoView({ behavior: 'smooth' })} />
          <NavItem icon={<Heart size={18} />} label="Favourite" onClick={() => navigate('/design/favourites')} />
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

        {/* Dynamic Split Layout: CHAT (left) + DESIGN AREA (right) */}
        <main className="flex-1 flex overflow-hidden">

          {/* CHAT COLUMN (LEFT) — real AI conversation, input at bottom */}
          <div className={`flex flex-col h-full bg-white custom-scrollbar ${hasGenerated ? 'w-[45%] border-r border-gray-100' : 'w-full overflow-y-auto'}`}>
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

              {/* Message History — the conversation */}
              <div ref={messagesRef} className={`px-8 py-6 custom-scrollbar flex flex-col gap-5 ${hasGenerated ? 'flex-1 overflow-y-auto' : 'flex-1'}`}>
                <AnimatePresence initial={false}>
                  {thread.map((item) => (
                      <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={item.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                    >
                      {item.role === 'user' ? (
                        <div className="bg-[#f0ede6] text-gray-800 p-4 rounded-xl text-sm font-medium leading-relaxed max-w-[85%] rounded-tr-sm">
                          {item.text}
                        </div>
                      ) : item.statusKey ? (
                        <div className="w-full max-w-[92%]">{renderStatus(item)}</div>
                      ) : item.plan ? (
                        <div className="w-full max-w-[92%] rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <LayoutTemplate size={15} className="text-indigo-600" />
                            <p className="text-sm font-bold text-gray-900">Design plan — v{item.planCount}</p>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">
                            {item.plan.style_mood} · {item.plan.color_direction} · {item.plan.font_direction}
                          </p>
                          <p className="text-xs text-gray-400 mb-3">
                            {item.plan.sections.length} sections — click below to approve or request changes
                          </p>
                          <div className="space-y-2.5 mb-4">
                            {item.plan.sections.map((s) => (
                              <div key={s.id} className="rounded-xl border border-indigo-100 bg-white p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-gray-900">{s.order}. {s.name}</p>
                                  <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                    {s.components.length} components
                                  </span>
                                </div>
                                {s.layout_intent && (
                                  <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{s.layout_intent}</p>
                                )}
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {s.components.map((c, ci) => (
                                    <span key={ci} className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 ring-1 ring-gray-100">
                                      {c.type}{c.count > 1 ? ` ×${c.count}` : ''}
                                    </span>
                                  ))}
                                </div>
                                {s.content && (
                                  <div className="mt-2 space-y-0.5">
                                    {s.content.headline && (
                                      <p className="text-[10px] font-semibold text-gray-700">→ {s.content.headline}</p>
                                    )}
                                    {s.content.subtext && (
                                      <p className="text-[10px] leading-relaxed text-gray-500">{s.content.subtext}</p>
                                    )}
                                    {Array.isArray(s.content.cta_buttons) && s.content.cta_buttons.length > 0 && (
                                      <p className="text-[10px] text-gray-600">CTA: {s.content.cta_buttons.join(' · ')}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {!changeOpen && (
                            <div className="flex gap-2">
                              <button
                                onClick={approvePlan}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                              >
                                <ShieldCheck size={14} /> Looks good, build it
                              </button>
                              <button
                                onClick={() => setChangeOpen(true)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                <Pencil size={14} /> Change something
                              </button>
                            </div>
                          )}
                          {changeOpen && (
                            <div className="rounded-xl border border-indigo-200 bg-white p-3">
                              <p className="text-xs font-bold text-gray-800 mb-2">What would you like to change? You can also just type it in the box below.</p>
                              <textarea
                                value={changeInput}
                                onChange={(e) => setChangeInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (changeInput.trim()) {
                                      const instruction = changeInput.trim();
                                      setChangeInput('');
                                      setChangeOpen(false);
                                      submitRevision(instruction);
                                    }
                                  }
                                }}
                                placeholder="e.g. use a dark theme, add a pricing section, only keep the hero section"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs outline-none focus:border-indigo-300 resize-none"
                                rows={3}
                                autoFocus
                              />
                              <div className="mt-2 flex items-center justify-end gap-2">
                                <button onClick={() => { setChangeOpen(false); setChangeInput(''); }} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    if (changeInput.trim()) {
                                      const instruction = changeInput.trim();
                                      setChangeInput('');
                                      setChangeOpen(false);
                                      submitRevision(instruction);
                                    }
                                  }}
                                  disabled={!changeInput.trim()}
                                  className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white disabled:opacity-40 transition-colors"
                                >
                                  <Send size={13} /> Revise plan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 max-w-[92%]">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-white">
                            <MessageSquare size={12} />
                          </div>
                          <p className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-gray-700 shadow-sm">
                            {item.text}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Chat Input Box — always pinned at bottom */}
              <div className="px-8 pb-6 pt-3 bg-white relative z-10">
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
                      placeholder={
                        phase === 'awaiting_approval'
                          ? 'Type a change here — e.g. "add a pricing section", "only keep hero", "use a dark theme"…'
                          : 'Describe your design, @ to reference images or documents'
                      }
                      className="w-full min-h-[100px] p-5 text-[15px] text-gray-700 bg-transparent resize-none outline-none placeholder-gray-400"
                      disabled={phase === 'pending' || phase === 'planning' || phase === 'images_generating' || phase === 'designing'}
                    />

                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50">
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
                        <button
                          onClick={handleSubmit}
                          disabled={
                            !chatInput.trim() ||
                            phase === 'pending' ||
                            phase === 'planning' ||
                            phase === 'images_generating' ||
                            phase === 'designing'
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-bold text-white hover:bg-[#4f46e5] transition-colors disabled:opacity-50 disabled:hover:bg-[#6366f1]"
                        >
                          <Send size={14} />
                          {phase === 'awaiting_approval' ? 'Revise plan' : 'Generate'}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* MODEL SELECTION DROPDOWN */}
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
              </div>
            </div>

            {/* Design Preferences + Past Designs (only in empty state) */}
            {!hasGenerated && (
              <div className="mx-auto w-full max-w-4xl px-8">
                <div className="mt-10">
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

                <div id="past-designs" className="mt-16 pb-10 w-full border-t border-gray-100 pt-12">
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
                            <button
                              onClick={(e) => toggleFavourite(p._id, e)}
                              title={p.favourite ? 'Remove from favourites' : 'Add to favourites'}
                              className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-colors ${
                                p.favourite ? 'text-rose-500' : 'text-gray-300 hover:text-rose-400'
                              }`}
                            >
                              <Heart size={13} fill={p.favourite ? 'currentColor' : 'none'} />
                            </button>
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
              </div>
            )}
          </div>

          {/* DESIGN AREA (RIGHT) — cursor builds the design live */}
          <AnimatePresence>
            {hasGenerated && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 h-full bg-[#f8f9fa] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] overflow-y-auto custom-scrollbar"
              >
                <div className="p-6 space-y-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-[#6366f1]" />
                      <h2 className="text-sm font-bold text-gray-800">Design Area</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[phase] || STATUS_STYLES.pending}`}>
                        {phase.replace('_', ' ')}
                      </span>
                    </div>
                    {phase === 'ready' && project && (
                      <button
                        onClick={() => navigate(`/design/projects/${project._id}`)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                      >
                        Open full studio <ArrowRight size={13} />
                      </button>
                    )}
                  </div>

                  {/* Pipeline steps */}
                  <div className="flex flex-wrap items-center gap-2">
                    {PHASE_STEPS.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          i < stepIdx ? 'bg-emerald-50 text-emerald-700' : i === stepIdx ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {i < stepIdx ? '✓' : i === stepIdx && stepIdx !== 3 ? '…' : ''} {step.label}
                        </span>
                        {i < PHASE_STEPS.length - 1 && <span className="h-px w-4 bg-gray-200" />}
                      </div>
                    ))}
                  </div>

                  {/* Live design canvas */}
                  {(tree || phase === 'designing' || phase === 'ready' || phase === 'failed') && (
                    <DesignCanvas tree={tree} builtIds={builtIds} cursor={cursor} buildingId={buildingId} />
                  )}

                  {/* Placeholders before canvas */}
                  {!tree && phase !== 'failed' && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                      {phase === 'planning' || phase === 'awaiting_approval' ? (
                        <>
                          <Layers size={22} className="mx-auto text-indigo-400" />
                          <p className="mt-3 text-sm font-semibold text-gray-600">
                            {phase === 'awaiting_approval' ? 'Plan ready — awaiting your approval' : 'Planning your design…'}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {phase === 'awaiting_approval'
                              ? 'Review the plan in the chat. Approve it or type changes to revise it.'
                              : 'The plan will show up in the chat on the left.'}
                          </p>
                        </>
                      ) : phase === 'images_generating' ? (
                        <>
                          <ImageIcon size={22} className="mx-auto text-sky-400" />
                          <p className="mt-3 text-sm font-semibold text-gray-600">Generating section mockups</p>
                          <p className="mt-1 text-xs text-gray-400">Design build starts right after mockups are ready.</p>
                        </>
                      ) : phase === 'ready' ? (
                        <>
                          <PartyPopper size={22} className="mx-auto text-emerald-400" />
                          <p className="mt-3 text-sm font-semibold text-gray-600">Design ready</p>
                          <p className="mt-1 text-xs text-gray-400">Open the full studio to customize and export.</p>
                        </>
                      ) : (
                        <>
                          <Sparkles size={22} className="mx-auto text-indigo-400" />
                          <p className="mt-3 text-sm font-semibold text-gray-600">Your design will be built here</p>
                          <p className="mt-1 text-xs text-gray-400">Describe what you want in the chat and hit Generate.</p>
                        </>
                      )}
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