import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PitchTrace } from '../types/analysis';

interface Props {
  data: PitchTrace;
  sampleCount: number;
}

export default function PitchChart({ data, sampleCount }: Props) {
  const step = sampleCount > 5000 ? 4 : 1;

  const chartData = data.time_s
    .filter((_, i) => i % step === 0)
    .map((t, i) => ({
      time: t.toFixed(2),
      pitch: data.pitch_deg[i * step],
      accel: data.accel_x_g[i * step],
    }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Pitch &amp; Acceleration Trace</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 40, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -16, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            yAxisId="pitch"
            label={{ value: 'Pitch (°)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            yAxisId="accel"
            orientation="right"
            label={{ value: 'Accel X (g)', angle: 90, position: 'insideRight', offset: 12, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine yAxisId="pitch" y={0} stroke="#9ca3af" strokeDasharray="4 2" />
          <Line
            yAxisId="pitch"
            type="monotone"
            dataKey="pitch"
            name="Pitch (°)"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={1.5}
          />
          <Line
            yAxisId="accel"
            type="monotone"
            dataKey="accel"
            name="Accel X (g)"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
