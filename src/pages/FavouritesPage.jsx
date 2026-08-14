import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { api, errorMsg } from '../lib/api.js';
import { useAuth } from '../context/useAuth.js';

const STATUS_STYLES = {
  pending: 'bg-gray-100 text-gray-600',
  planning: 'bg-amber-50 text-amber-700',
  images_generating: 'bg-sky-50 text-sky-700',
  designing: 'bg-violet-50 text-violet-700',
  ready: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
};

export default function FavouritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/projects', { params: { favourite: 'true' } });
      setProjects(data.projects);
    } catch (err) {
      setError(errorMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavourite = async (projectId) => {
    try {
      await api.patch(`/projects/${projectId}/favourite`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/design" className="flex items-center gap-1.5 text-sm font-medium text-[#667085] hover:text-[#111827]">
              <ArrowLeft size={16} /> Back
            </Link>
            <span className="h-4 w-px bg-gray-200" />
            <Heart size={18} className="text-rose-500" />
            <span className="text-sm font-semibold text-[#111827]">Favourites</span>
          </div>
          <span className="text-xs font-medium text-gray-400">{user?.name || ''}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <Heart size={24} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">No favourites yet</p>
            <p className="mt-1 text-xs text-gray-400">Open a past design and tap the heart to save it here.</p>
            <button
              onClick={() => navigate('/design')}
              className="mt-5 rounded-full bg-[#6366f1] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#4f46e5] transition-colors"
            >
              Go to designs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {projects.map((p) => (
              <div key={p._id} className="group cursor-pointer" onClick={() => navigate(`/design/projects/${p._id}`)}>
                <div className="relative h-40 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 mb-3 transition-all group-hover:border-[#6366f1] group-hover:shadow-md">
                  <div className="absolute top-0 left-0 flex h-8 w-full items-center gap-2 border-b border-gray-100 bg-white px-3">
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                  <div className="absolute top-12 left-4 h-4 w-1/3 rounded bg-gray-200"></div>
                  <div className="absolute top-20 left-4 right-4 h-16 rounded-lg border border-gray-100 bg-white shadow-sm"></div>
                  <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavourite(p._id);
                    }}
                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm border border-gray-100 hover:bg-rose-50 transition-colors"
                    title="Remove from favourites"
                  >
                    <Heart size={15} fill="currentColor" />
                  </button>
                </div>
                <h4 className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors group-hover:text-[#6366f1]">{p.prompt}</h4>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString()} · {p.platform}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
