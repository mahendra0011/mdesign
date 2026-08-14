import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ImagePlus, Sparkles, Heart } from 'lucide-react';
import { api, errorMsg } from '../lib/api.js';
import { connectSocket, joinProject } from '../lib/socket.js';
import { attachPuterBridge } from '../lib/puterBridge.js';
import DesignCanvas from '../components/studio/DesignCanvas.jsx';
import CustomizePanel from '../components/studio/CustomizePanel.jsx';
import ExportPanel from '../components/studio/ExportPanel.jsx';
import { modelLabel } from '../lib/modelLabel.js';

const STEPS = [
  { id: 'planning', label: 'Planning' },
  { id: 'images_generating', label: 'Mockups' },
  { id: 'designing', label: 'Design build' },
  { id: 'ready', label: 'Ready' },
];

function statusIndex(status) {
  const map = { pending: -1, planning: 0, images_generating: 1, designing: 2, ready: 3, failed: 3 };
  return map[status] ?? -1;
}

function ModelsTab({ projectId }) {
  const [overrides, setOverrides] = useState({ textModel: 'default', imageModel: 'default', designModel: 'default' });
  const [models, setModels] = useState({ text: [], image: [], design: [], multimodal: [] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}/models`),
      api.get('/models', { params: { category: 'text' } }),
      api.get('/models', { params: { category: 'image' } }),
      api.get('/models', { params: { category: 'design' } }),
      api.get('/models', { params: { category: 'multimodal' } }),
    ]).then(([projectRes, text, image, design, multimodal]) => {
      setOverrides({
        textModel: projectRes.data.overrides?.textModel || 'default',
        imageModel: projectRes.data.overrides?.imageModel || 'default',
        designModel: projectRes.data.overrides?.designModel || 'default',
      });
      setModels({ text: text.data.models, image: image.data.models, design: design.data.models, multimodal: multimodal.data.models });
    }).catch(() => {});
  }, [projectId]);

  const save = async () => {
    try {
      await api.put(`/projects/${projectId}/models`, overrides);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const rows = [
    { key: 'textModel', label: 'Planning / text model', options: [...models.text, ...models.multimodal] },
    { key: 'imageModel', label: 'Image model', options: models.image },
    { key: 'designModel', label: 'UI design model', options: [...models.design, ...models.multimodal] },
  ];

  return (
    <div className="space-y-4 px-4 py-4">
      <p className="text-xs text-[#667085]">
        These overrides apply to this project only — priority is project → your defaults → system default.
      </p>
      {rows.map((row) => (
        <label key={row.key} className="flex items-center justify-between gap-2 text-xs text-[#374151]">
          <span>{row.label}</span>
          <select value={overrides[row.key]}
            onChange={(e) => setOverrides((prev) => ({ ...prev, [row.key]: e.target.value }))}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-500">
            <option value="default">Default</option>
            {row.options.map((m) => (
              <option key={m.modelId} value={m.modelId}>
                {modelLabel(m)}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button onClick={save} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
        {saved ? 'Saved ✓' : 'Save overrides'}
      </button>
      <p className="text-[11px] leading-relaxed text-[#98A2B3]">
        Tip: three different slots can share one multimodal model — just pick the same model in all three dropdowns.
      </p>
    </div>
  );
}

export default function StudioPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const [tree, setTree] = useState(null);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('customize');
  const [builtIds, setBuiltIds] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [buildingId, setBuildingId] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [notice, setNotice] = useState('');
  const [favourite, setFavourite] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeInput, setChangeInput] = useState('');
  const imageMap = useRef(new Map());

  const token = localStorage.getItem('mdesign_token');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.project);
      setStatus(data.project.status);
      setFavourite(!!data.project.favourite);
      imageMap.current = new Map(data.images.map((img) => [img.index, img]));
      setImages(data.images);
      if (data.latestVersion) {
        setTree(data.latestVersion.designJson);
        setBuiltIds(null);
      }
    } catch (err) {
      setError(errorMsg(err));
    }
  }, [id]);

  const approvePlan = async () => {
    try {
      await api.post(`/projects/${id}/plan/approve`);
      setStatus('images_generating');
      setStreaming(true);
      setChangeOpen(false);
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  const submitReplan = async () => {
    const instruction = changeInput.trim();
    if (!instruction) return;
    try {
      await api.post(`/projects/${id}/plan/replan`, { instruction });
      setChangeInput('');
      setChangeOpen(false);
      setStatus('planning');
      setStreaming(true);
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    socket.on('connect', () => joinProject(socket, id));
    attachPuterBridge(socket);

    socket.on('pipeline_status', ({ status: s }) => {
      setStatus(s);
      setStreaming(s === 'planning' || s === 'images_generating' || s === 'designing');
    });
    socket.on('plan_ready', () => load());
    socket.on('image_status', ({ index, total, status: s, url, sectionId }) => {
      setNotice(`Mockup ${index + 1}/${total} ${s === 'failed' ? 'failed — will use placeholder' : 'done'}`);
      imageMap.current.set(index, { index, status: s, url, sectionId });
      const sorted = Array.from(imageMap.current.values()).sort((a, b) => a.index - b.index);
      setImages([...sorted]);
      if (s === 'failed' && index === total - 1) setTimeout(() => setNotice(''), 4000);
    });
    socket.on('section_start', ({ section_id }) => {
      setNotice(`Building section ${section_id}`);
      document.getElementById(`section-${section_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    socket.on('cursor_move', ({ x_pct, y_pct, clicking, component_id }) => setCursor({ x_pct, y_pct, clicking, component_id }));
    socket.on('component_build_start', ({ component_id }) => {
      setBuildingId(component_id);
      setBuiltIds((prev) => (prev ? prev : new Set()));
    });
    socket.on('component_build_done', ({ component_id }) => {
      setBuiltIds((prev) => {
        const next = prev || new Set();
        if (next.has(component_id)) return prev;
        const copy = new Set(next);
        copy.add(component_id);
        return copy;
      });
      setBuildingId(null);
    });
    socket.on('section_done', () => setCursor(null));
    socket.on('design_complete', () => {
      setStreaming(false);
      setCursor(null);
      setBuildingId(null);
    });
    socket.on('design_ready', ({ versionNo, designJson }) => {
      setTree(designJson);
      setStatus('ready');
      setStreaming(false);
      setBuiltIds(null);
      setCursor(null);
      setNotice(`Design ready — version ${versionNo}`);
    });
    socket.on('design_updated', ({ versionNo, designJson, warnings }) => {
      setTree(designJson);
      setNotice(warnings?.length ? `Updated v${versionNo} — ${warnings.join('; ')}` : `Updated v${versionNo}`);
      setTimeout(() => setNotice(''), 3500);
      load();
    });
    socket.on('job_failed', ({ error: msg }) => setNotice(`Pipeline failed: ${msg}`));
    socket.on('disconnect', () => {});

    return () => {
      socket.off('connect');
      socket.off('pipeline_status');
      socket.off('plan_ready');
      socket.off('image_status');
      socket.off('section_start');
      socket.off('cursor_move');
      socket.off('component_build_start');
      socket.off('component_build_done');
      socket.off('section_done');
      socket.off('design_complete');
      socket.off('design_ready');
      socket.off('design_updated');
      socket.off('job_failed');
      socket.off('disconnect');
    };
  }, [id, token, load]);

  const regen = async (index) => {
    try {
      await api.post(`/projects/${id}/regenerate-image`, { index });
      setNotice(`Queued regeneration for mockup ${index + 1}`);
    } catch (err) {
      setNotice(errorMsg(err));
    }
  };

  const replay = async (pace = 'normal') => {
    setBuiltIds(new Set());
    try {
      await api.post(`/projects/${id}/replay`, { pace });
      setStreaming(true);
    } catch (err) {
      setNotice(errorMsg(err));
    }
  };

  const toggleFavourite = async () => {
    try {
      const { data } = await api.patch(`/projects/${id}/favourite`);
      setFavourite(data.favourite);
    } catch (err) {
      setNotice(errorMsg(err));
    }
  };

  const imagesOrdered = useMemo(() => images, [images]);
  const ready = status === 'ready';
  const stepIdx = statusIndex(status);

  if (error && !project) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-red-600 font-sans">{error}</div>;
  }
  if (!project) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#667085] font-sans">Loading project...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/design" className="flex items-center gap-1.5 text-sm font-medium text-[#667085] hover:text-[#111827]">
              <ArrowLeft size={16} /> Studio
            </Link>
            <span className="h-4 w-px bg-gray-200" />
            <Sparkles size={18} className="text-indigo-600" />
            <span className="max-w-md truncate text-sm font-semibold text-[#111827]">{project.prompt}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFavourite}
              title={favourite ? 'Remove from favourites' : 'Add to favourites'}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                favourite ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-gray-200 bg-white text-gray-400 hover:text-rose-500'
              }`}
            >
              <Heart size={15} fill={favourite ? 'currentColor' : 'none'} />
            </button>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              ready ? 'bg-emerald-50 text-emerald-700' : status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
            }`}>
              {status.replace('_', ' ')}
            </span>
            {ready && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
                  {[
                    { id: 'fast', label: 'Fast' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'cinematic', label: 'Cinematic' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => replay(p.id)}
                      className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#667085] hover:bg-gray-50 hover:text-[#111827] transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => replay('normal')} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] hover:border-indigo-200">
                  <RefreshCw size={13} /> Replay build
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {notice && (
        <div className="mx-auto mt-4 max-w-7xl px-6">
          <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">{notice}</div>
        </div>
      )}

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#111827]">Pipeline</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    i < stepIdx ? 'bg-emerald-50 text-emerald-700' : i === stepIdx ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i < stepIdx ? '✓' : i === stepIdx && stepIdx !== 3 ? '…' : ''} {step.label}
                  </span>
                  {i < STEPS.length - 1 && <span className="h-px w-4 bg-gray-200" />}
                </div>
              ))}
            </div>

            {project?.planStatus === 'awaiting_approval' && project?.plan && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#111827]">Plan ready — approve to start building</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.plan.sections.map((s) => (
                        <span key={s.id} className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
                          {s.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={approvePlan} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                      Build it
                    </button>
                    <button onClick={() => setChangeOpen(!changeOpen)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#667085] hover:text-[#111827]">
                      Change
                    </button>
                  </div>
                </div>
                {changeOpen && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={changeInput}
                      onChange={(e) => setChangeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitReplan()}
                      placeholder="Tell me what to change..."
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-300"
                    />
                    <button onClick={submitReplan} className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white">
                      Send
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {imagesOrdered.map((img) => (
                <div key={img.index} className="relative aspect-video overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  {img.url ? (
                    <img src={img.url} alt={`mockup ${img.index + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full animate-pulse items-center justify-center text-[10px] text-gray-300">
                      {img.status === 'failed' ? 'placeholder' : `generating ${img.index + 1}`}
                    </div>
                  )}
                  {img.status !== 'processing' && (
                    <button onClick={() => regen(img.index)}
                      className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100">
                      <ImagePlus size={10} /> regen
                    </button>
                  )}
                </div>
              ))}
              {imagesOrdered.length === 0 && streaming && (
                <div className="col-span-full py-4 text-center text-xs text-[#98A2B3]">Waiting for planning to define mockups...</div>
              )}
            </div>
          </section>

          <DesignCanvas tree={tree} builtIds={builtIds} cursor={cursor} buildingId={buildingId} />
        </div>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'customize', label: 'Customize' },
              { id: 'models', label: 'Models' },
              { id: 'export', label: 'Export' },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  tab === t.id ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-[#98A2B3] hover:text-[#667085]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'customize' && <CustomizePanel projectId={id} tree={tree} onPatched={setTree} disabled={!ready} />}
          {tab === 'models' && <ModelsTab projectId={id} />}
          {tab === 'export' && <ExportPanel projectId={id} disabled={!ready} />}
        </aside>
      </main>
    </div>
  );
}