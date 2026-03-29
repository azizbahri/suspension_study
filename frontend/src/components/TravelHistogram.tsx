import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { TravelHistogram as TravelHistogramType } from '../types/analysis';

interface Props {
  data: TravelHistogramType;
  title: string;
}

export default function TravelHistogram({ data, title }: Props) {
  const chartData = data.centers_pct.map((c, i) => ({
    travel: c.toFixed(1),
    time: data.time_pct[i],
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <div className="text-xs text-gray-500 mb-3">
        Peak: {data.peak_center_pct.toFixed(1)}% &nbsp;|&nbsp; Above 80%:{' '}
        {data.pct_above_80.toFixed(1)}% of time
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="travel"
            label={{ value: 'Travel (%)', position: 'insideBottom', offset: -16, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            label={{ value: 'Time (%)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip formatter={(v) => [typeof v === 'number' ? `${v.toFixed(2)}%` : v, 'Time']} />
          <ReferenceLine
            x="30.0"
            stroke="#22c55e"
            strokeDasharray="4 2"
            label={{ value: 'Sag', position: 'top', fontSize: 10, fill: '#22c55e' }}
          />
          <ReferenceLine
            x="80.0"
            stroke="#ef4444"
            strokeDasharray="4 2"
            label={{ value: '80%', position: 'top', fontSize: 10, fill: '#ef4444' }}
          />
          <Bar dataKey="time" fill="#f97316" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
