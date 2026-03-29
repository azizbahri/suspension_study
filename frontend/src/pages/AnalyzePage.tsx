import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSessions } from '../hooks/useSessions';
import { useAnalyzeSession } from '../hooks/useAnalysis';
import TravelHistogram from '../components/TravelHistogram';
import VelocityHistogram from '../components/VelocityHistogram';
import PitchChart from '../components/PitchChart';
import DiagnosticCard from '../components/DiagnosticCard';
import ChartDetailSidebar, { type ChartKey } from '../components/ChartDetailSidebar';
import type { AnalysisResult } from '../types/analysis';

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;

export default function AnalyzePage() {
  const [searchParams] = useSearchParams();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    searchParams.get('session') ?? ''
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartKey | null>(null);

  const { data: sessions = [] } = useSessions();
  const { mutateAsync: analyze, isPending } = useAnalyzeSession();

  // Pre-select from URL param
  useEffect(() => {
    const id = searchParams.get('session');
    if (id) setSelectedSessionId(id);
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!selectedSessionId) return;
    setError(null);
    try {
      const res = await analyze(selectedSessionId);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    }
  };

  const sortedDiagnostics = result
    ? [...result.diagnostics].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      )
    : [];

  const handleChartClick = (key: ChartKey) => {
    setSelectedChart((prev) => (prev === key ? null : key));
  };

  const chartClickProps = (key: ChartKey) => ({
    onClick: () => handleChartClick(key),
    className: `cursor-pointer rounded-lg transition-shadow hover:shadow-md ring-2 ${
      selectedChart === key ? 'ring-orange-400' : 'ring-transparent'
    }`,
    title: 'Click to see chart details',
  });

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-5">
        <h1 className="text-xl font-semibold text-gray-900">Analyze</h1>

        {/* Session selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
          <select
            value={selectedSessionId}
            onChange={(e) => { setSelectedSessionId(e.target.value); setResult(null); setError(null); setSelectedChart(null); }}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select session…</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.analyzed ? '✓' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={isPending || !selectedSessionId}
            className="px-5 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Analyzing…' : 'Analyze / Re-analyze'}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {result && (
          <>
            {/* Travel + Velocity histograms */}
            <div className="grid grid-cols-2 gap-5">
              {/* Front */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Front Suspension
                </h2>
                <div {...chartClickProps('front_travel')}>
                  <TravelHistogram data={result.front_travel} title="Travel Distribution" />
                </div>
                <div {...chartClickProps('front_velocity')}>
                  <VelocityHistogram data={result.front_velocity} title="Velocity Distribution" />
                </div>
              </div>
              {/* Rear */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Rear Suspension
                </h2>
                <div {...chartClickProps('rear_travel')}>
                  <TravelHistogram data={result.rear_travel} title="Travel Distribution" />
                </div>
                <div {...chartClickProps('rear_velocity')}>
                  <VelocityHistogram data={result.rear_velocity} title="Velocity Distribution" />
                </div>
              </div>
            </div>

            {/* Pitch chart */}
            <div {...chartClickProps('pitch')}>
              <PitchChart data={result.pitch} sampleCount={result.sample_count} />
            </div>

            {/* Diagnostics */}
            {sortedDiagnostics.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-700">Diagnostics</h2>
                {sortedDiagnostics.map((note) => (
                  <DiagnosticCard key={note.rule_id} note={note} />
                ))}
              </div>
            )}

            {/* Footer metadata */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 px-5 py-3 text-xs text-gray-500 flex gap-6">
              <span>
                <span className="font-medium text-gray-700">Duration:</span>{' '}
                {result.duration_s.toFixed(1)} s
              </span>
              <span>
                <span className="font-medium text-gray-700">Samples:</span>{' '}
                {result.sample_count.toLocaleString()}
              </span>
              <span>
                <span className="font-medium text-gray-700">Session ID:</span> {result.session_id}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Collapsible chart-detail sidebar */}
      <ChartDetailSidebar
        chart={selectedChart}
        result={result}
        isOpen={selectedChart !== null}
        onClose={() => setSelectedChart(null)}
      />
    </>
  );
}
