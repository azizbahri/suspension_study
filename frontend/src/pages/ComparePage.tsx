import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { compareSession } from '../api/compare';
import type { CompareResult } from '../api/compare';
import { useSessions } from '../hooks/useSessions';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { TravelHistogram, VelocityHistogram } from '../types/analysis';

const SESSION_COLORS = ['#f97316', '#3b82f6', '#22c55e'];

function OverlaidTravelChart({
  sessions,
}: {
  sessions: Array<{ name: string; data: TravelHistogram; color: string }>;
}) {
  if (sessions.length === 0) return null;
  const bins = sessions[0].data.centers_pct;
  const chartData = bins.map((c, i) => {
    const row: Record<string, number | string> = { travel: c.toFixed(1) };
    sessions.forEach((s) => { row[s.name] = s.data.time_pct[i]; });
    return row;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Travel Distribution Overlay</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="travel"
            label={{ value: 'Travel (%)', position: 'insideBottom', offset: -16, fontSize: 11 }}
            tick={{ fontSize: 9 }}
          />
          <YAxis
            label={{ value: 'Time (%)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine x="80.0" stroke="#ef4444" strokeDasharray="4 2" />
          <ReferenceLine x="30.0" stroke="#22c55e" strokeDasharray="4 2" />
          {sessions.map((s) => (
            <Bar key={s.name} dataKey={s.name} fill={s.color} opacity={0.75} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function OverlaidVelocityChart({
  sessions,
}: {
  sessions: Array<{ name: string; data: VelocityHistogram; color: string }>;
}) {
  if (sessions.length === 0) return null;
  const bins = sessions[0].data.centers_mm_s;
  const chartData = bins.map((c, i) => {
    const row: Record<string, number | string> = { velocity: c.toFixed(0) };
    sessions.forEach((s) => { row[s.name] = s.data.time_pct[i]; });
    return row;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Velocity Distribution Overlay</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="velocity"
            label={{ value: 'Velocity (mm/s)', position: 'insideBottom', offset: -16, fontSize: 11 }}
            tick={{ fontSize: 9 }}
          />
          <YAxis
            label={{ value: 'Time (%)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine x="0" stroke="#9ca3af" />
          <ReferenceLine x="-150" stroke="#6b7280" strokeDasharray="4 2" />
          <ReferenceLine x="150" stroke="#6b7280" strokeDasharray="4 2" />
          {sessions.map((s) => (
            <Bar key={s.name} dataKey={s.name} fill={s.color} opacity={0.75} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ComparePage() {
  const { data: sessions = [] } = useSessions();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [granularity, setGranularity] = useState<'session' | 'segment'>('session');
  const [segmentDuration, setSegmentDuration] = useState(10);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: compare, isPending } = useMutation({
    mutationFn: compareSession,
  });

  const toggleSession = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleCompare = async () => {
    setError(null);
    try {
      const res = await compare({
        session_ids: selectedIds,
        granularity,
        segment_duration_s: granularity === 'segment' ? segmentDuration : undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compare failed');
    }
  };

  const frontSessions = result
    ? result.sessions.map((s, i) => ({
        name: s.session_name,
        data: s.result.front_travel,
        color: SESSION_COLORS[i] ?? '#888',
      }))
    : [];

  const rearSessions = result
    ? result.sessions.map((s, i) => ({
        name: s.session_name,
        data: s.result.rear_travel,
        color: SESSION_COLORS[i] ?? '#888',
      }))
    : [];

  const frontVelSessions = result
    ? result.sessions.map((s, i) => ({
        name: s.session_name,
        data: s.result.front_velocity,
        color: SESSION_COLORS[i] ?? '#888',
      }))
    : [];

  const rearVelSessions = result
    ? result.sessions.map((s, i) => ({
        name: s.session_name,
        data: s.result.rear_velocity,
        color: SESSION_COLORS[i] ?? '#888',
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Compare Sessions</h1>

      <div className="bg-white rounded-lg shadow-sm p-5 space-y-5">
        {/* Session checkboxes */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Select up to 3 sessions</p>
          <div className="space-y-1.5">
            {sessions.map((s) => {
              const color = SESSION_COLORS[selectedIds.indexOf(s.id)];
              const isSelected = selectedIds.includes(s.id);
              const isDisabled = !isSelected && selectedIds.length >= 3;
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 cursor-pointer text-sm rounded-md px-3 py-2 border transition-colors ${
                    isSelected
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSession(s.id)}
                    disabled={isDisabled}
                    className="accent-orange-500"
                  />
                  {isSelected && color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                  )}
                  <span className="flex-1">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.bike_slug}</span>
                  {s.analyzed && <span className="text-xs text-green-500">analyzed</span>}
                </label>
              );
            })}
            {sessions.length === 0 && (
              <p className="text-xs text-gray-400">No sessions available. Import some first.</p>
            )}
          </div>
        </div>

        {/* Granularity toggle */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Granularity</p>
          <div className="flex gap-3 items-center">
            {(['session', 'segment'] as const).map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="granularity"
                  value={g}
                  checked={granularity === g}
                  onChange={() => setGranularity(g)}
                  className="accent-orange-500"
                />
                <span className="capitalize">{g}-level</span>
              </label>
            ))}
            {granularity === 'segment' && (
              <div className="flex items-center gap-2 ml-4">
                <label className="text-xs text-gray-600">Segment duration (s):</label>
                <input
                  type="number"
                  min={1}
                  value={segmentDuration}
                  onChange={(e) => setSegmentDuration(Number(e.target.value))}
                  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          onClick={handleCompare}
          disabled={isPending || selectedIds.length < 2}
          className="px-6 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Comparing…' : 'Compare'}
        </button>
      </div>

      {result && (
        <div className="space-y-5">
          {/* Front travel + velocity */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Front
              </h2>
              <OverlaidTravelChart sessions={frontSessions} />
              <div className="mt-4">
                <OverlaidVelocityChart sessions={frontVelSessions} />
              </div>
            </div>
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Rear
              </h2>
              <OverlaidTravelChart sessions={rearSessions} />
              <div className="mt-4">
                <OverlaidVelocityChart sessions={rearVelSessions} />
              </div>
            </div>
          </div>

          {/* Session summary table */}
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Session Summary</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 pr-4">Session</th>
                  <th className="text-left py-2 pr-4">Duration</th>
                  <th className="text-left py-2 pr-4">Front peak</th>
                  <th className="text-left py-2 pr-4">Rear peak</th>
                  <th className="text-left py-2 pr-4">Front &gt;80%</th>
                  <th className="text-left py-2">Rear &gt;80%</th>
                </tr>
              </thead>
              <tbody>
                {result.sessions.map((s, i) => (
                  <tr key={s.session_id} className="border-b border-gray-50">
                    <td className="py-2 pr-4 flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: SESSION_COLORS[i] ?? '#888' }}
                      />
                      {s.session_name}
                    </td>
                    <td className="py-2 pr-4">{s.result.duration_s.toFixed(1)} s</td>
                    <td className="py-2 pr-4">{s.result.front_travel.peak_center_pct.toFixed(1)}%</td>
                    <td className="py-2 pr-4">{s.result.rear_travel.peak_center_pct.toFixed(1)}%</td>
                    <td className="py-2 pr-4">{s.result.front_travel.pct_above_80.toFixed(1)}%</td>
                    <td className="py-2">{s.result.rear_travel.pct_above_80.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
