import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, Loader2, PenTool, Copy, Check } from 'lucide-react';
import { api, errorMsg } from '../../lib/api.js';

const TARGETS = [
  { id: 'html', label: 'HTML/CSS' },
  { id: 'react', label: 'React JSX' },
  { id: 'svg', label: 'Flat SVG' },
  { id: 'png', label: 'Flat PNG' },
  { id: 'figma', label: 'Figma file' },
];

function downloadBlob(filename, content, mime) {
  const blob = content.startsWith('data:') ? fetch(content).then((r) => r.blob()) : Promise.resolve(new Blob([content], { type: mime }));
  blob.then((b) => {
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export default function ExportPanel({ projectId, disabled }) {
  const [busy, setBusy] = useState(null);
  const [jobs, setJobs] = useState({});
  const [figmaConnected, setFigmaConnected] = useState(null);
  const [payload, setPayload] = useState(null);
  const [copied, setCopied] = useState(false);
  const pollTimers = useRef({});

  const checkFigma = useCallback(async () => {
    try {
      const { data } = await api.get('/integrations/figma/status');
      setFigmaConnected(data.connected);
    } catch {
      setFigmaConnected(false);
    }
  }, []);

  useEffect(() => {
    checkFigma();
  }, [checkFigma]);

  const pollJob = useCallback((jobId) => {
    const tick = async () => {
      try {
        const { data } = await api.get(`/exports/${jobId}`);
        setJobs((prev) => ({ ...prev, [jobId]: data.job }));
        if (data.job.status === 'queued' || data.job.status === 'processing') {
          pollTimers.current[jobId] = setTimeout(tick, 1500);
        } else {
          setBusy(null);
        }
      } catch {
        setBusy(null);
      }
    };
    tick();
  }, []);

  useEffect(() => () => Object.values(pollTimers.current).forEach(clearTimeout), []);

  const start = async (target) => {
    setBusy(target);
    setPayload(null);
    setJobs((prev) => ({ ...prev, pending: { target, status: 'queued' } }));
    try {
      const { data } = await api.post(`/exports/${projectId}/export`, { target });
      pollJob(data.job._id);
    } catch (err) {
      setBusy(null);
      setJobs((prev) => ({ ...prev, pending: { target, status: 'failed', error: errorMsg(err) } }));
    }
  };

  const connectFigma = async () => {
    const { data } = await api.get('/integrations/figma/connect');
    window.open(data.authUrl, '_blank');
    checkFigma();
  };

  const job = jobs[busy] || jobs.pending || null;

  return (
    <div className="space-y-6 px-4 py-4">
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">Export design as</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TARGETS.map((t) => (
            <button key={t.id} onClick={() => start(t.id)} disabled={disabled || busy}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-40">
              <span>{t.label}</span>
              {busy === t.id ? <Loader2 size={15} className="animate-spin text-indigo-600" /> : <Download size={15} className="text-[#98A2B3]" />}
            </button>
          ))}
        </div>

        {job?.status === 'done' && (
          <div className="mt-3 space-y-2 rounded-lg bg-emerald-50 p-3 text-sm">
            <p className="font-semibold text-emerald-700">{job.target} export complete</p>
            {['html', 'react', 'svg'].includes(job.target) && (
              <button onClick={() => downloadBlob(`mdesign.${job.target === 'react' ? 'jsx' : job.target}`, job.output, 'text/plain')}
                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                Download file
              </button>
            )}
            {job.target === 'png' && job.output && (
              <a href={job.output} download="mdesign.png"
                className="inline-block rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                Download PNG
              </a>
            )}
            {job.target === 'figma' && (
              <div className="space-y-2 text-xs text-emerald-800">
                <a href={job.outputUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 font-semibold underline">
                  <PenTool size={14} /> Open Figma file <ExternalLink size={12} />
                </a>
                <p className="text-[11px] leading-relaxed text-emerald-600">
                  Node tree is staged as a transfer payload — import it in Figma with the
                  “MDesign Import” plugin (<span className="font-medium">figma-plugin/</span> folder,
                  Plugins → Development → Link existing plugin).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={async () => {
                      let text = payload;
                      if (!text) {
                        const { data } = await api.get(`/exports/${job._id}/figma-payload`);
                        text = JSON.stringify(data.payload, null, 2);
                        setPayload(text);
                      }
                      try {
                        await navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      } catch { /* clipboard unavailable */ }
                    }}
                    className="flex items-center gap-1.5 rounded bg-emerald-100 px-2.5 py-1.5 font-medium text-emerald-800 hover:bg-emerald-200">
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy payload JSON'}
                  </button>
                  <button onClick={async () => {
                      const { data } = await api.get(`/exports/${job._id}/figma-payload`);
                      setPayload(JSON.stringify(data.payload, null, 2));
                    }}
                    className="rounded bg-emerald-100 px-2.5 py-1.5 font-medium text-emerald-800 hover:bg-emerald-200">
                    View payload
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {job?.status === 'failed' && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{job.error || 'Export failed'}</p>
        )}
        {payload && (
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-gray-900 p-3 text-[10px] leading-relaxed text-gray-200">{payload}</pre>
        )}
      </section>

      <section className="rounded-xl border border-gray-100 p-3">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#98A2B3]">
          <PenTool size={13} /> Figma integration
        </h3>
        <p className="mt-2 text-xs text-[#667085]">Connect your Figma account so exports can create files in your workspace.</p>
        {figmaConnected === null ? (
          <p className="mt-2 text-xs text-[#98A2B3]">Checking connection...</p>
        ) : figmaConnected ? (
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">✓ Figma connected</p>
        ) : (
          <button onClick={connectFigma}
            className="mt-2 rounded-lg bg-[#111827] px-3 py-2 text-xs font-semibold text-white hover:bg-black">
            Connect Figma via OAuth
          </button>
        )}
      </section>
    </div>
  );
}