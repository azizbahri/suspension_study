import { X } from 'lucide-react';
import type { AnalysisResult, DiagnosticNote } from '../types/analysis';
import DiagnosticCard from './DiagnosticCard';

export type ChartKey =
  | 'front_travel'
  | 'rear_travel'
  | 'front_velocity'
  | 'rear_velocity'
  | 'pitch';

interface ChartInfo {
  title: string;
  description: string;
  interpretation: string[];
}

const CHART_INFO: Record<ChartKey, ChartInfo> = {
  front_travel: {
    title: 'Front Travel Distribution',
    description:
      'Shows how the front fork travel is distributed across the session. Each bar represents the percentage of total ride time spent at that travel depth, expressed as a fraction of maximum available stroke.',
    interpretation: [
      'Green reference line at 30 % = ideal sag target. At rest under rider weight the fork should sit here, leaving stroke available to extend over drops and compression ruts.',
      'Red reference line at 80 % = bottoming-zone threshold. Time spent above this line risks coil-spring or oil-lock bottoming.',
      'Peak bucket shows where the fork spends most time. A healthy setup peaks near the sag point (25–35 %).',
      'Peak far below 25 %: spring may be too stiff or preload too high. Peak above 40 %: spring too soft or compression damping too low.',
      '"Above 80 %" time exceeding 5–10 % suggests the fork needs a stiffer spring or more high-speed compression damping.',
    ],
  },
  rear_travel: {
    title: 'Rear Travel Distribution',
    description:
      'Shows how the rear shock travel is distributed across the session. Each bar represents the percentage of total ride time spent at that travel depth, expressed as a fraction of maximum available stroke.',
    interpretation: [
      'Green reference line at 30 % = ideal sag target. Rear sag is typically set to 25–30 % of stroke under rider weight.',
      'Red reference line at 80 % = bottoming threshold. Consistent time above this zone indicates the shock needs a stiffer spring.',
      'Peak bucket near sag = balanced setup. A peak shifted right suggests the spring is too soft or the shock needs more preload.',
      'Rear suspension sees acceleration-induced squat; a slight right bias compared to the front is normal during hard acceleration zones.',
    ],
  },
  front_velocity: {
    title: 'Front Damper Velocity Distribution',
    description:
      'Histogram of front fork shaft velocity. Negative values (red bars) are compression strokes; positive values (green bars) are rebound strokes. The ±150 mm/s boundaries split low-speed from high-speed damping zones.',
    interpretation: [
      'Low-speed compression (LS-C, |v| < 150 mm/s): controls body-motion damping over smooth terrain. Adjusted by the LSC clicker.',
      'High-speed compression (HS-C, |v| > 150 mm/s): controls impact response on square-edge hits. Adjusted by the HSC adjuster.',
      'Low-speed rebound (LS-R): governs how fast the fork returns from body-motion compressions. Too slow = packing; too fast = headshake.',
      'High-speed rebound (HS-R): controls kick-back after sharp impacts. Too fast = harsh feel; too slow = packing on successive bumps.',
      'A roughly symmetric compression/rebound split indicates balanced damping. Heavy compression bias may mean under-damped compression or very aggressive terrain.',
    ],
  },
  rear_velocity: {
    title: 'Rear Damper Velocity Distribution',
    description:
      'Histogram of rear shock shaft velocity. Negative values (red bars) are compression strokes; positive values (green bars) are rebound strokes. The ±150 mm/s thresholds split low-speed from high-speed damping zones.',
    interpretation: [
      'LS-C zone governs body squat damping under acceleration and braking forces. Adjust with the LSC clicker.',
      'HS-C zone governs impact absorption on roots, rocks, and drops. Adjust with the HSC adjuster.',
      'LS-R governs recovery from body-motion compressions. Too slow = brake-induced packing on rough descents.',
      'HS-R governs recovery from sharp impacts. Too fast causes rear bounce; too slow causes packing on repeated hits.',
      'Rear shock sees more compression during acceleration and more rebound during braking — a slight asymmetry is expected.',
    ],
  },
  pitch: {
    title: 'Pitch & Acceleration Trace',
    description:
      'Time-series of chassis pitch angle (°) and longitudinal acceleration (g) over the session. Pitch is estimated with a complementary filter (α = 0.98) that fuses the gyroscope (short-term accuracy) with the accelerometer gravity reference (long-term drift correction).',
    interpretation: [
      'Negative pitch angle = nose-down (braking event, steep descent). Positive = nose-up (acceleration, climb).',
      'Braking events appear as synchronized negative pitch + negative acceleration spikes.',
      'Hard acceleration events appear as positive pitch + positive acceleration.',
      'The complementary filter prevents gyro bias from accumulating over the session while rejecting vibration artifacts in the accelerometer signal.',
      'Large sustained negative pitch during descents is normal. Abrupt pitch transitions indicate sharp terrain or high-intensity rider inputs.',
    ],
  },
};

// Map chart keys to diagnostic rule_id prefixes for filtering related diagnostics
const CHART_DIAGNOSTIC_PREFIXES: Record<ChartKey, string[]> = {
  front_travel: ['front_travel', 'front'],
  rear_travel: ['rear_travel', 'rear'],
  front_velocity: ['front_velocity', 'front'],
  rear_velocity: ['rear_velocity', 'rear'],
  pitch: ['pitch', 'imu', 'accel'],
};

function getRelatedDiagnostics(chart: ChartKey, diagnostics: DiagnosticNote[]): DiagnosticNote[] {
  const prefixes = CHART_DIAGNOSTIC_PREFIXES[chart];
  return diagnostics.filter((d) =>
    prefixes.some((p) => d.rule_id.toLowerCase().startsWith(p))
  );
}

// ── Key-metrics sub-component ─────────────────────────────────────────────────

type MetricHighlight = 'ok' | 'caution' | 'warn';

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: MetricHighlight;
}) {
  const valueColor =
    highlight === 'warn'
      ? 'text-red-600'
      : highlight === 'caution'
      ? 'text-yellow-600'
      : 'text-gray-900';
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${valueColor}`}>{value}</div>
    </div>
  );
}

function KeyMetrics({ chart, result }: { chart: ChartKey; result: AnalysisResult }) {
  if (chart === 'front_travel' || chart === 'rear_travel') {
    const data = chart === 'front_travel' ? result.front_travel : result.rear_travel;
    return (
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Peak Travel" value={`${data.peak_center_pct.toFixed(1)} %`} />
        <Metric
          label="Time Above 80 %"
          value={`${data.pct_above_80.toFixed(1)} %`}
          highlight={data.pct_above_80 > 10 ? 'warn' : data.pct_above_80 > 5 ? 'caution' : 'ok'}
        />
      </div>
    );
  }

  if (chart === 'front_velocity' || chart === 'rear_velocity') {
    const data = chart === 'front_velocity' ? result.front_velocity : result.rear_velocity;
    return (
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Compression" value={`${data.compression_area_pct.toFixed(1)} %`} />
        <Metric label="Rebound" value={`${data.rebound_area_pct.toFixed(1)} %`} />
        <Metric label="LS-Compression" value={`${data.ls_compression_pct.toFixed(1)} %`} />
        <Metric label="HS-Compression" value={`${data.hs_compression_pct.toFixed(1)} %`} />
        <Metric label="LS-Rebound" value={`${data.ls_rebound_pct.toFixed(1)} %`} />
        <Metric label="HS-Rebound" value={`${data.hs_rebound_pct.toFixed(1)} %`} />
      </div>
    );
  }

  if (chart === 'pitch') {
    const d = result.pitch;
    const maxPitch = Math.max(...d.pitch_deg).toFixed(1);
    const minPitch = Math.min(...d.pitch_deg).toFixed(1);
    const maxAccel = Math.max(...d.accel_x_g).toFixed(2);
    const minAccel = Math.min(...d.accel_x_g).toFixed(2);
    return (
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Peak Pitch (nose-up)" value={`${maxPitch} °`} />
        <Metric label="Min Pitch (nose-down)" value={`${minPitch} °`} />
        <Metric label="Peak Accel" value={`${maxAccel} g`} />
        <Metric label="Min Accel (braking)" value={`${minAccel} g`} />
      </div>
    );
  }

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  chart: ChartKey | null;
  result: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChartDetailSidebar({ chart, result, isOpen, onClose }: Props) {
  const info = chart ? CHART_INFO[chart] : null;
  const relatedDiagnostics =
    chart && result ? getRelatedDiagnostics(chart, result.diagnostics) : [];

  return (
    <>
      {/* Transparent backdrop – clicking it closes the sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={onClose}
          aria-hidden="true"
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar panel */}
      <aside
        aria-label="Chart details"
        className={`fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-30 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 leading-tight">
            {info ? info.title : 'Chart Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close chart details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {info && chart && result ? (
            <>
              {/* What this chart shows */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  What this chart shows
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{info.description}</p>
              </section>

              {/* Key metrics */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Key Metrics
                </h3>
                <KeyMetrics chart={chart} result={result} />
              </section>

              {/* How to interpret */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  How to interpret
                </h3>
                <ul className="space-y-2">
                  {info.interpretation.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">·</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Related diagnostics */}
              {relatedDiagnostics.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Related Diagnostics
                  </h3>
                  <div className="space-y-2">
                    {relatedDiagnostics.map((d) => (
                      <DiagnosticCard key={d.rule_id} note={d} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Click a chart to see details.</p>
          )}
        </div>
      </aside>
    </>
  );
}
