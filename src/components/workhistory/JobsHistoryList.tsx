import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { listSearchHistoryForUser, type SearchHistoryVaultRow } from '../../lib/services/jobService';
import { supabase } from '../../lib/supabase';
import { writeJobFinderWarehouseRestore, type JobFinderUiState } from '../../lib/userJobHistory';

function formatHistoryPhrase(phrase: string): string {
  const t = phrase.trim();
  if (!t) return '';
  return t
    .split(/\s+/)
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

export default function JobsHistoryList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SearchHistoryVaultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const data = await listSearchHistoryForUser(session?.access_token ?? null);
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatSearchDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const handleRestoreSession = (row: SearchHistoryVaultRow) => {
    const ids = Array.isArray(row.job_ids) ? row.job_ids.map((x) => String(x)).filter(Boolean) : [];
    if (ids.length === 0) return;

    const kw = formatHistoryPhrase(row.keywords);
    const loc = formatHistoryPhrase(row.location);
    const meta: JobFinderUiState = {
      quickSearchJobTitle: kw || undefined,
      quickSearchLocation: loc || undefined,
      selectedSearchStrategy: row.intent?.trim() ? row.intent.trim() : null,
    };
    writeJobFinderWarehouseRestore(ids, meta);
    navigate('/job-finder/results');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading jobs history…</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 mb-2">No saved searches yet</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Run a search in Job Finder and open the results workspace. Sessions are kept for 30 days so you can reopen the same listings from our job warehouse.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80">
        <h2 className="text-lg font-bold text-neutral-900">Jobs History</h2>
        <p className="text-sm text-slate-500 mt-0.5">Past searches (stored for 30 days)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3">Search</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const kw = formatHistoryPhrase(row.keywords);
              const loc = row.location.trim() ? formatHistoryPhrase(row.location) : 'Any location';
              const hasIds = Array.isArray(row.job_ids) && row.job_ids.length > 0;
              return (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-neutral-900 font-medium max-w-lg">
                    <span className="line-clamp-2" title={`${kw} · ${loc}`}>
                      Searched for {kw || '—'} in {loc}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatSearchDate(row.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRestoreSession(row)}
                      disabled={!hasIds}
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Restore Session
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
