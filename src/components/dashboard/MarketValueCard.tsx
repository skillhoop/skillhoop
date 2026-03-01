/**
 * Market Value Card — Fetches market insights from Supabase (get_market_insights RPC)
 * and displays avg_min_salary / avg_max_salary for the active job, formatted in INR.
 */

import { useEffect, useState } from 'react';

export interface ActiveJob {
  title: string;
  location: string;
}

export interface MarketInsightsRow {
  avg_min_salary?: number | null;
  avg_max_salary?: number | null;
  [key: string]: unknown;
}

/** Format a number as Indian Rupees (INR) for Hyderabad/India market, e.g. ₹12 L or ₹1.5 Cr */
export function formatSalaryINR(amount: number): string {
  if (amount >= 1_00_00_000) {
    const cr = amount / 1_00_00_000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(1).replace(/\.0$/, '')} Cr`;
  }
  if (amount >= 1_00_000) {
    const lakhs = amount / 1_00_000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1).replace(/\.0$/, '')} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Format a salary range for Hyderabad/India market (INR) */
export function formatMarketRangeINR(minSalary: number, maxSalary: number): string {
  return `${formatSalaryINR(minSalary)} – ${formatSalaryINR(maxSalary)}`;
}

export interface MarketValueCardProps {
  /** Active job whose title and location are used to fetch market insights */
  activeJob: ActiveJob | null;
  /** Optional class name for the card container */
  className?: string;
}

export function MarketValueCard({ activeJob, className = '' }: MarketValueCardProps) {
  const [insights, setInsights] = useState<MarketInsightsRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeJob?.title?.trim()) {
      setInsights(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_market_insights',
            title: activeJob.title.trim(),
            location: (activeJob.location || '').trim() || undefined,
          }),
        });
        const json = await res.json();

        if (cancelled) return;
        if (!res.ok) {
          const message =
            res.status === 500
              ? 'Benchmark data currently unavailable for this role'
              : ((json.error as string) || 'Failed to load market insights');
          setError(message);
          setInsights(null);
          return;
        }

        const data = json.data;
        // RPC may return a single row or an array of rows; take first row with salary data
        const row = Array.isArray(data) ? data[0] : data;
        if (row && (row.avg_min_salary != null || row.avg_max_salary != null)) {
          setInsights(row as MarketInsightsRow);
        } else {
          setInsights(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load market insights');
          setInsights(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeJob?.title, activeJob?.location]);

  const hasSalary =
    insights &&
    (insights.avg_min_salary != null || insights.avg_max_salary != null);
  const minSal = hasSalary && insights.avg_min_salary != null ? Number(insights.avg_min_salary) : null;
  const maxSal = hasSalary && insights.avg_max_salary != null ? Number(insights.avg_max_salary) : null;
  const displayRange =
    minSal != null && maxSal != null
      ? formatMarketRangeINR(minSal, maxSal)
      : minSal != null
        ? `${formatSalaryINR(minSal)}+`
        : maxSal != null
          ? `Up to ${formatSalaryINR(maxSal)}`
          : null;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
      data-testid="market-value-card"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 leading-tight">Market Value</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Compensation benchmark (Hyderabad / INR)</p>
        </div>
      </div>
      <div className="mt-3">
        {loading && (
          <p className="text-sm text-slate-500">Loading market data…</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {!loading && !error && displayRange && (
          <div className="flex flex-col gap-1">
            <div className="text-lg font-black text-slate-900 tracking-tight">
              {displayRange}
            </div>
            <span className="text-[10px] font-bold text-[#6b8e23] bg-[#f4f5f0] px-1.5 py-0.5 rounded w-fit">
              Range
            </span>
          </div>
        )}
        {!loading && !error && !displayRange && activeJob?.title && (
          <p className="text-sm text-slate-500">No salary data for this role/location.</p>
        )}
        {!loading && !activeJob?.title && (
          <p className="text-sm text-slate-500">Select a job to see market value.</p>
        )}
      </div>
    </div>
  );
}

export default MarketValueCard;
