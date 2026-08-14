import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Sparkles, PenTool } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';
import { api, errorMsg } from '../lib/api.js';
import { connectSocket, joinUser } from '../lib/socket.js';
import { attachPuterBridge } from '../lib/puterBridge.js';

const STATUS_STYLES = {
  uploaded: 'bg-sky-50 text-sky-700',
  analyzing: 'bg-amber-50 text-amber-700',
  analyzed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
};

export default function UploadPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const applyStatus = (id, status, analysisResult) => {
    setUploads((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status, analysisResult } : u))
    );
  };

  const load = async () => {
    try {
      const { data } = await api.get('/uploads');
      setUploads(data.uploads);
    } catch (err) {
      setError(errorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    const join = () => {
      if (user?._id) joinUser(socket, user._id);
    };
    if (socket.connected) join();
    else socket.on('connect', join);
    attachPuterBridge(socket);

    socket.on('upload:analysis_started', ({ uploadedDesignId }) => {
      applyStatus(uploadedDesignId, 'analyzing');
    });
    socket.on('upload:analysis_done', ({ uploadedDesignId, analysisResult }) => {
      applyStatus(uploadedDesignId, 'analyzed', analysisResult);
    });
    socket.on('upload:analysis_failed', ({ uploadedDesignId }) => {
      applyStatus(uploadedDesignId, 'failed');
    });
  }, [token, user?._id]);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/uploads/design', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploads((prev) => [data.uploadedDesign, ...prev]);
    } catch (err) {
      setError(errorMsg(err));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadFile(file);
  };

  const createProject = async (upload) => {
    setError('');
    try {
      const { data } = await api.post(`/uploads/${upload._id}/project`);
      navigate(`/design/projects/${data.project._id}`);
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link to="/design" className="flex items-center gap-1.5 text-sm font-medium text-[#667085] hover:text-[#111827]">
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              <span className="text-lg font-black tracking-tight text-[#111827]">Upload &amp; Analyse</span>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {user?.creditsRemaining ?? 0} credits
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-12 text-center transition-colors ${
            dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              uploadFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Upload size={32} className="text-indigo-600" />
          <p className="mt-3 text-sm font-semibold text-[#111827]">
            {uploading ? 'Uploading...' : 'Drop a design image here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-[#98A2B3]">
            PNG, JPG or WebP — MDesign will analyse sections, colors and layout with AI.
          </p>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#98A2B3]">Your uploads</h3>
          {loading ? (
            <p className="mt-4 text-sm text-[#667085]">Loading uploads...</p>
          ) : uploads.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-[#98A2B3]">
              Nothing uploaded yet — drop a design above to get started.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uploads.map((u) => (
                <div
                  key={u._id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <img
                    src={u.originalFileUrl}
                    alt="Uploaded design"
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[u.status] || STATUS_STYLES.uploaded}`}>
                        {u.status}
                      </span>
                      <span className="text-[11px] text-[#98A2B3]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {u.status === 'analyzed' && (
                      <p className="mt-2 text-xs text-[#667085]">
                        {u.analysisResult?.detectedSections?.length || 0} sections detected ·{' '}
                        {(u.analysisResult?.colorPalette || []).length || 0} colors
                      </p>
                    )}
                    {u.status === 'failed' && (
                      <p className="mt-2 text-xs text-red-500">{u.analysisError}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => createProject(u)}
                        disabled={u.status !== 'analyzed'}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                      >
                        <Sparkles size={13} /> Recreate with AI
                      </button>
                      <button
                        onClick={() => navigate(`/design/customise/${u._id}`)}
                        disabled={u.status !== 'analyzed'}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-gray-50 disabled:opacity-40"
                      >
                        <PenTool size={13} /> Customise
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}