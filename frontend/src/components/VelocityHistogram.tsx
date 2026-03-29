import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { VelocityHistogram as VelocityHistogramType } from '../types/analysis';

interface Props {
  data: VelocityHistogramType;
  title: string;
}

export default function VelocityHistogram({ data, title }: Props) {
  const chartData = data.centers_mm_s.map((c, i) => ({
    velocity: c.toFixed(0),
    time: data.time_pct[i],
    center: c,
  }));

  const legendPayload = [
    { value: `Comp ${data.compression_area_pct.toFixed(1)}%`, color: '#ef4444' },
    { value: `Reb ${data.rebound_area_pct.toFixed(1)}%`, color: '#22c55e' },
    { value: `LS-C ${data.ls_compression_pct.toFixed(1)}%`, color: '#fca5a5' },
    { value: `HS-C ${data.hs_compression_pct.toFixed(1)}%`, color: '#b91c1c' },
    { value: `LS-R ${data.ls_rebound_pct.toFixed(1)}%`, color: '#86efac' },
    { value: `HS-R ${data.hs_rebound_pct.toFixed(1)}%`, color: '#15803d' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <div className="flex flex-wrap gap-3 mb-2">
        {legendPayload.map((l) => (
          <span key={l.value} className="flex items-center gap-1 text-xs text-gray-600">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: l.color }} />
            {l.value}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
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
          <Tooltip formatter={(v) => [typeof v === 'number' ? `${v.toFixed(2)}%` : v, 'Time']} />
          <ReferenceLine x="0" stroke="#9ca3af" strokeWidth={1} />
          <ReferenceLine
            x="-150"
            stroke="#6b7280"
            strokeDasharray="4 2"
            label={{ value: 'LS|HS', position: 'top', fontSize: 9, fill: '#6b7280' }}
          />
          <ReferenceLine
            x="150"
            stroke="#6b7280"
            strokeDasharray="4 2"
            label={{ value: 'LS|HS', position: 'top', fontSize: 9, fill: '#6b7280' }}
          />
          <Bar dataKey="time" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.center < 0 ? '#ef4444' : '#22c55e'}
              />
            ))}
          </Bar>
          <Legend content={() => null} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
