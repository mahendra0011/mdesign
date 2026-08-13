import { useCallback, useEffect, useMemo, useState } from 'react';
import { Wand2, RotateCcw, History } from 'lucide-react';
import { api, errorMsg } from '../../lib/api.js';

const FONTS = ['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Playfair Display', 'Space Grotesk'];

export default function CustomizePanel({ projectId, tree, onPatched, disabled }) {
  const [versions, setVersions] = useState([]);
  const [instruction, setInstruction] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timers, setTimers] = useState({});

  const loadVersions = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/versions`);
      setVersions(data.versions);
    } catch {
      /* ignore */
    }
  }, [projectId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions, tree?.sections?.length]);

  const flat = useMemo(() => {
    const rows = [];
    (tree?.sections || []).forEach((section) => {
      (section.components || []).forEach((component) => {
        rows.push({ section: section, component });
      });
    });
    return rows;
  }, [tree]);

  const tokens = tree?.tokens || {};
  const tokenKeys = Object.keys(tokens.colors || {});
  const textRows = flat.filter((r) => ['heading', 'subheading', 'paragraph', 'button', 'link', 'badge'].includes(r.component.type));

  const patch = async (operations, optimistic) => {
    try {
      if (optimistic) onPatched(optimistic);
      const { data } = await api.patch(`/projects/${projectId}/design`, { operations });
      if (data.warnings?.length) setMessage(`Applied — warnings: ${data.warnings.join('; ')}`);
      else setMessage('Applied');
      setError('');
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  const debouncedPatch = (key, operations, optimistic) => {
    if (timers[key]) clearTimeout(timers[key]);
    timers[key] = setTimeout(() => patch(operations, optimistic), 600);
    setTimers({ ...timers });
  };

  const updateText = (row, value) => {
    onPatched(applyLocal(row, tree, 'props.text', value));
    debouncedPatch(`text_${row.component.id}`, [{ op: 'update_text', target: row.component.id, value }]);
  };

  const updateToken = (key, value) => {
    const next = {
      ...tree,
      tokens: { ...tokens, colors: { ...tokens.colors, [key]: value } },
    };
    onPatched(next);
    debouncedPatch(`token_${key}`, [{ op: 'update_token', target: `tokens.colors.${key}`, value }]);
  };

  const updateFont = (key, value) => {
    const next = { ...tree, tokens: { ...tokens, fonts: { ...tokens.fonts, [key]: value } } };
    onPatched(next);
    debouncedPatch(`font_${key}`, [{ op: 'update_token', target: `tokens.fonts.${key}`, value }]);
  };

  const aiAssist = async () => {
    if (!instruction.trim()) return;
    setAiBusy(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post(`/projects/${projectId}/customize-ai`, { instruction });
      if (data.warnings?.length) setMessage(`AI applied — warnings: ${data.warnings.join('; ')}`);
      else setMessage('AI changes applied');
      setInstruction('');
    } catch (err) {
      setError(errorMsg(err));
    } finally {
      setAiBusy(false);
    }
  };

  const revert = async (versionNo) => {
    try {
      const { data } = await api.post(`/projects/${projectId}/revert`, { versionNo });
      setMessage(data.restored ? `Restored version ${versionNo} (new v${data.version.versionNo})` : 'Already at this version');
      setError('');
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  if (!tree) {
    return <div className="px-4 py-8 text-center text-sm text-[#98A2B3]">No design yet — wait for the pipeline to finish.</div>;
  }

  return (
    <div className="space-y-6 px-4 py-4">
      <section>
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#98A2B3]">
          <History size={13} /> AI-assisted edits
        </h3>
        <div className="mt-2 flex gap-2">
          <textarea
            value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={2}
            placeholder='e.g. "make this section more colorful"'
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button onClick={aiAssist} disabled={aiBusy || disabled}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            <Wand2 size={14} /> {aiBusy ? '...' : 'Apply'}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">Colors</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {tokenKeys.map((key) => (
            <label key={key} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 text-xs text-[#374151]">
              <input type="color" value={tokens.colors[key] || '#000000'} disabled={disabled}
                onChange={(e) => updateToken(key, e.target.value)} className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0" />
              <span className="truncate">{key}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">Fonts</h3>
        <div className="mt-2 space-y-2">
          {Object.keys(tokens.fonts || {}).map((key) => (
            <label key={key} className="flex items-center justify-between gap-2 text-xs text-[#374151]">
              <span className="capitalize">{key}</span>
              <select value={tokens.fonts[key] || 'Inter'} disabled={disabled}
                onChange={(e) => updateFont(key, e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-500">
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          ))}
        </div>
      </section>

      {textRows.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">Copy</h3>
          <div className="mt-2 space-y-2">
            {textRows.map((row) => (
              <div key={row.component.id} className="rounded-lg border border-gray-100 p-2">
                <div className="mb-1 flex items-center justify-between text-[10px] text-[#98A2B3]">
                  <span className="font-mono">{row.section.name || row.section.id}</span>
                  <span>{row.component.id}</span>
                </div>
                <input
                  value={row.component.props?.text || ''} disabled={disabled}
                  onChange={(e) => updateText(row, e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">
          Version history ({versions.length})
        </h3>
        <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
          {versions.map((v) => (
            <div key={v.versionNo} className="flex items-center justify-between rounded-lg border border-gray-100 px-2.5 py-1.5 text-xs">
              <div>
                <span className="font-semibold text-[#111827]">v{v.versionNo}</span>
                <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-[#667085]">{v.createdBy}</span>
                {v.parentVersion != null && <span className="ml-1 text-[10px] text-[#98A2B3]">← v{v.parentVersion}</span>}
              </div>
              <button onClick={() => revert(v.versionNo)} disabled={disabled}
                className="flex items-center gap-1 rounded px-2 py-1 font-medium text-indigo-600 hover:bg-indigo-50">
                <RotateCcw size={12} /> Revert
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function applyLocal(row, tree, field, value) {
  return {
    ...tree,
    sections: (tree.sections || []).map((section) => {
      if (section.id !== row.section.id) return section;
      return {
        ...section,
        components: (section.components || []).map((component) => {
          if (component.id !== row.component.id) return component;
          if (field === 'props.text') return { ...component, props: { ...component.props, text: value } };
          return { ...component, style: { ...component.style, [field]: value } };
        }),
      };
    }),
  };
}