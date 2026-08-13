import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  Trash2,
  Eraser,
  Save,
  Plus,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/useAuth.js';
import { api, errorMsg } from '../lib/api.js';
import { connectSocket, joinUser } from '../lib/socket.js';

const ELEMENT_TYPE_LABELS = { image: 'Image', logo: 'Logo', icon: 'Icon', shape: 'Shape' };

export default function CustomisePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { uploadId } = useParams();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [placeAt, setPlaceAt] = useState(null);
  const [busy, setBusy] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [genPrompt, setGenPrompt] = useState('');
  const [genType, setGenType] = useState('image');
  const [saving, setSaving] = useState(false);
  const elementInputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.post('/customise/sessions', { uploadedDesignId: uploadId });
      setSession(data.session);
    } catch (err) {
      setError(errorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    const join = () => {
      if (user?._id) joinUser(socket, user._id);
    };
    if (socket.connected) join();
    else socket.on('connect', join);

    socket.on('customise:updated', ({ sessionId }) => {
      if (sessionId === session?._id) load();
    });
    socket.on('customise:generating', () => setBusy('generating'));
    socket.on('customise:generated', () => setBusy(''));
    socket.on('customise:generate_failed', ({ error: msg }) => {
      setBusy('');
      setError(msg || 'Generation failed');
    });
  }, [token, user?._id, session?._id, load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7fb] font-sans text-sm text-[#667085]">
        Loading editor...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f7f7fb] font-sans">
        <p className="text-sm text-red-600">{error || 'Session could not be loaded'}</p>
        <Link to="/design/uploads" className="text-sm font-semibold text-indigo-600">
          Back to uploads
        </Link>
      </div>
    );
  }

  const selected = session.elements?.find((el) => el.elementId === selectedId) || null;

  const refresh = (next) => {
    setSession(next);
    setBusy('');
  };

  const canvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPlaceAt({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
    });
    setSelectedId(null);
  };

  const addElement = async (file) => {
    if (!file) return;
    setBusy('uploading');
    setError('');
    try {
      const form = new FormData();
      form.append('elementImage', file);
      form.append('x', String(placeAt?.x ?? 40));
      form.append('y', String(placeAt?.y ?? 40));
      form.append('width', '20');
      form.append('height', '20');
      const { data } = await api.post(`/customise/sessions/${session._id}/add-element`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      refresh(data.session);
    } catch (err) {
      setError(errorMsg(err));
      setBusy('');
    }
  };

  const removeSelected = async () => {
    if (!selected) return;
    setBusy('removing');
    setError('');
    try {
      const { data } = await api.delete(
        `/customise/sessions/${session._id}/elements/${selected.elementId}`
      );
      setSelectedId(null);
      refresh(data.session);
    } catch (err) {
      setError(errorMsg(err));
      setBusy('');
    }
  };

  const run = async (action, body = {}) => {
    setBusy(action);
    setError('');
    try {
      const { data } = await api.post(
        `/customise/sessions/${session._id}${action}`,
        body
      );
      refresh(data.session);
      return data;
    } catch (err) {
      setError(errorMsg(err));
      setBusy('');
      return null;
    }
  };

  const generate = async () => {
    if (!genPrompt.trim()) return;
    await run('/generate-element', { prompt: genPrompt.trim(), elementType: genType });
    setGenPrompt('');
  };

  const saveTemplate = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post(`/customise/sessions/${session._id}/save-as-template`);
      navigate(`/design/projects/${data.project._id}`);
    } catch (err) {
      setError(errorMsg(err));
      setSaving(false);
    }
  };

  const ToolButton = ({ onClick, disabled, busy, children }) => (
    <button
      onClick={onClick}
      disabled={disabled || !!busy}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#111827] hover:bg-gray-50 disabled:opacity-40"
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : children}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb] font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link to="/design/uploads" className="flex items-center gap-1.5 text-sm font-medium text-[#667085] hover:text-[#111827]">
              <ArrowLeft size={16} /> Uploads
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              <span className="text-lg font-black tracking-tight text-[#111827]">Customise</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {user?.creditsRemaining ?? 0} credits
            </span>
            <button
              onClick={saveTemplate}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save as template
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-6">
        <div className="flex-1">
          <div className="relative mx-auto max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <img
              src={session.currentCompositeUrl}
              alt="Customisation canvas"
              draggable={false}
              onClick={canvasClick}
              className="block w-full select-none"
            />
            {session.elements?.map((el) => (
              <div
                key={el.elementId}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(el.elementId);
                }}
                className={`absolute cursor-pointer border-2 transition-colors ${
                  selectedId === el.elementId
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-transparent hover:border-indigo-300'
                }`}
                style={{
                  left: `${el.bbox?.x || 0}%`,
                  top: `${el.bbox?.y || 0}%`,
                  width: `${el.bbox?.width || 15}%`,
                  height: `${el.bbox?.height || 15}%`,
                }}
                title={`${el.type} (${el.elementId})`}
              />
            ))}
          </div>
          {placeAt && (
            <p className="mt-2 text-xs text-[#98A2B3]">
              Placement point: {placeAt.x}%, {placeAt.y}% — now add an element.
            </p>
          )}
        </div>

        <aside className="w-72 shrink-0 space-y-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#111827]">Elements</h3>
            <p className="mt-0.5 text-xs text-[#98A2B3]">
              {session.elements?.length || 0} on canvas — click one to select it.
            </p>
            <div className="mt-3 space-y-2">
              <ToolButton onClick={() => elementInputRef.current?.click()}>
                <Plus size={15} /> Add image element
              </ToolButton>
              <input
                ref={elementInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  addElement(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <ToolButton
                onClick={removeSelected}
                disabled={!selected}
                busy={busy === 'removing'}
              >
                <Trash2 size={15} /> Remove selected
              </ToolButton>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#111827]">Background</h3>
            <div className="mt-3 space-y-2">
              <ToolButton
                onClick={() => run('/background/remove')}
                busy={busy === '/background/remove'}
              >
                <Eraser size={15} /> Remove background (AI)
              </ToolButton>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-gray-200"
                  title="Background colour"
                />
                <button
                  onClick={() => run('/background/change', { mode: 'color', color: bgColor })}
                  disabled={!!busy}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#111827] hover:bg-gray-50 disabled:opacity-40"
                >
                  Set colour
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#111827]">AI generate element</h3>
            <textarea
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              rows={2}
              placeholder="e.g. a glowing neon logo for a cyberpunk brand"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              {Object.entries(ELEMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={generate}
              disabled={!genPrompt.trim() || !!busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {busy === 'generating' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Wand2 size={15} />
              )}
              Generate
            </button>
          </section>
        </aside>
      </main>
    </div>
  );
}