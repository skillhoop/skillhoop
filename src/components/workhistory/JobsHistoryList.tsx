import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import {
  listUserJobHistory,
  intentStrategyToBadgeLabel,
  writeJobFinderSessionRestore,
  type UserJobHistoryRow,
} from '../../lib/userJobHistory';

export default function JobsHistoryList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserJobHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await listUserJobHistory();
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

  const handleViewResults = (row: UserJobHistoryRow) => {
    const jobs = row.jobs_snapshot;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return;
    }
    const meta = {
      ...row.ui_state,
      selectedSearchStrategy: row.ui_state?.selectedSearchStrategy ?? row.intent,
    };
    writeJobFinderSessionRestore(jobs, meta);
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
        <h3 className="text-lg font-bold text-neutral-900 mb-2">No saved job searches yet</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Run a personalized search in Job Finder. Each search is saved here so you can reopen the same results and filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80">
        <h2 className="text-lg font-bold text-neutral-900">Jobs History</h2>
        <p className="text-sm text-slate-500 mt-0.5">Past searches and AI match sessions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Search keywords</th>
              <th className="px-6 py-3">Intent</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatSearchDate(row.created_at)}</td>
                <td className="px-6 py-4 text-neutral-900 font-medium max-w-md">
                  <span className="line-clamp-2" title={row.query}>
                    {row.query || '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-100">
                    {intentStrategyToBadgeLabel(row.intent)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleViewResults(row)}
                    disabled={!Array.isArray(row.jobs_snapshot) || row.jobs_snapshot.length === 0}
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    View Results
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
