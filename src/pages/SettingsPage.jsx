import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PenTool, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';
import { api, errorMsg } from '../lib/api.js';
import { modelLabel } from '../lib/modelLabel.js';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [models, setModels] = useState({ text: [], image: [], design: [], multimodal: [] });
  const [prefs, setPrefs] = useState({ textModel: 'default', imageModel: 'default', designModel: 'default' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [figmaConnected, setFigmaConnected] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [text, image, design, multimodal, prefsRes, figmaRes] = await Promise.all([
          api.get('/models', { params: { category: 'text' } }),
          api.get('/models', { params: { category: 'image' } }),
          api.get('/models', { params: { category: 'design' } }),
          api.get('/models', { params: { category: 'multimodal' } }),
          api.get('/models/preferences'),
          api.get('/integrations/figma/status'),
        ]);
        setModels({ text: text.data.models, image: image.data.models, design: design.data.models, multimodal: multimodal.data.models });
        setPrefs({ textModel: prefsRes.data.preferences.textModel, imageModel: prefsRes.data.preferences.imageModel, designModel: prefsRes.data.preferences.designModel });
        setFigmaConnected(figmaRes.data.connected);
      } catch (err) {
        setError(errorMsg(err));
      }
    })();
  }, []);

  const sync = async () => {
    setSyncing(true);
    setError('');
    setSyncInfo('');
    try {
      const { data } = await api.post('/models/sync');
      const parts = [];
      if (data.results?.syncPuterModels?.count) parts.push(`Puter: ${data.results.syncPuterModels.count}`);
      if (data.results?.syncOpenRouterModels?.count) parts.push(`OpenRouter: ${data.results.syncOpenRouterModels.count}`);
      for (const key of Object.keys(data.results || {})) {
        if (data.results[key].error) parts.push(`${key}: ${data.results[key].error}`);
      }
      setSyncInfo(parts.join(' · ') || 'Sync complete');
      const [text, image, design, multimodal] = await Promise.all([
        api.get('/models', { params: { category: 'text' } }),
        api.get('/models', { params: { category: 'image' } }),
        api.get('/models', { params: { category: 'design' } }),
        api.get('/models', { params: { category: 'multimodal' } }),
      ]);
      setModels({ text: text.data.models, image: image.data.models, design: design.data.models, multimodal: multimodal.data.models });
    } catch (err) {
      setError(errorMsg(err));
    } finally {
      setSyncing(false);
    }
  };

  const save = async () => {
    try {
      await api.put('/models/preferences', prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  const connectFigma = async () => {
    const { data } = await api.get('/integrations/figma/connect');
    window.open(data.authUrl, '_blank');
  };

  const rows = [
    { key: 'textModel', label: 'Text / planning model', options: [...models.text, ...models.multimodal] },
    { key: 'imageModel', label: 'Image model', options: models.image },
    { key: 'designModel', label: 'UI/UX design model', options: [...models.design, ...models.multimodal] },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7fb] font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <Link to="/design" className="flex items-center gap-1.5 text-sm font-medium text-[#667085] hover:text-[#111827]">
            <ArrowLeft size={16} /> Studio
          </Link>
          <span className="text-sm font-semibold text-[#111827]">Settings</span>
          <button onClick={logout} className="text-sm font-medium text-[#667085] hover:text-[#111827]">Sign out</button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Model selection</h2>
              <p className="mt-1 text-sm text-[#667085]">
                Pick models independently — or select one multimodal model for all three slots. 🟢 free / 🟡 quota-tier.
              </p>
            </div>
            <button onClick={sync} disabled={syncing}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-gray-50 disabled:opacity-40">
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} /> Refresh catalog
            </button>
          </div>
          {syncInfo && <p className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">{syncInfo}</p>}
          <div className="mt-5 space-y-4">
            {rows.map((row) => (
              <label key={row.key} className="block">
                <span className="text-sm font-medium text-[#374151]">{row.label} ({row.options.length} models)</span>
                <select value={prefs[row.key]}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, [row.key]: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500">
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
          <button onClick={save} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            {saved ? 'Saved ✓' : 'Save preferences'}
          </button>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#111827]">
            <PenTool size={18} /> Figma
          </h2>
          <p className="mt-1 text-sm text-[#667085]">
            Needed for the "Figma file" export — OAuth consent grants backend access to create files in your workspace.
          </p>
          {figmaConnected === null ? (
            <p className="mt-3 text-xs text-[#98A2B3]">Checking connection...</p>
          ) : figmaConnected ? (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              ✓ Figma account connected
            </p>
          ) : (
            <button onClick={connectFigma}
              className="mt-3 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              Connect Figma account
            </button>
          )}
          <p className="mt-3 text-sm text-[#667085]">
            Signed in as <span className="font-semibold text-[#111827]">{user?.email}</span> ·{' '}
            {user?.creditsRemaining ?? 0} credits remaining
          </p>
        </section>
      </main>
    </div>
  );
}