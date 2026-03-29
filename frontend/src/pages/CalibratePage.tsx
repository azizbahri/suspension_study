import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { calibrateFront, calibrateRear, getCalibrationExamples } from '../api/calibrate';
import type { FrontCalibrationResult, RearCalibrationResult } from '../api/calibrate';
import { useBikes, useCreateBike, useUpdateBike, useDeleteBike } from '../hooks/useBikes';
import type { BikeProfile } from '../types/bike';

type FrontRow = { stroke_mm: string; voltage_v: string };
type RearRow = { shock_stroke_mm: string; wheel_travel_mm: string };

const emptyFrontRows = (): FrontRow[] => [
  { stroke_mm: '', voltage_v: '' },
  { stroke_mm: '', voltage_v: '' },
  { stroke_mm: '', voltage_v: '' },
];

const emptyRearRows = (): RearRow[] => [
  { shock_stroke_mm: '', wheel_travel_mm: '' },
  { shock_stroke_mm: '', wheel_travel_mm: '' },
  { shock_stroke_mm: '', wheel_travel_mm: '' },
];

const EMPTY_BIKE: Omit<BikeProfile, 'slug'> & { slug: string } = {
  name: '',
  slug: '',
  w_max_front_mm: 300,
  w_max_rear_mm: 310,
  fork_angle_deg: 27.5,
  c_front: 1.0,
  v0_front: 0.0,
  c_rear: 1.0,
  v0_rear: 0.0,
  linkage_a: 0,
  linkage_b: 1,
  linkage_c: 0,
  adc_bits: 12,
  v_ref: 3.3,
  fs_hz: 200,
  lpf_cutoff_disp_hz: 20,
  lpf_cutoff_gyro_hz: 30,
  complementary_alpha: 0.98,
  stationary_samples: 200,
  gyro_sensitivity: 131,
  accel_sensitivity: 16384,
  ls_threshold_mm_s: 150,
};

const inputCls =
  'border border-gray-300 rounded-md px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-orange-500';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

function NumericInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        className={inputCls}
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function CalibratePage() {
  const { data: bikes = [], isLoading } = useBikes();
  const createBike = useCreateBike();
  const updateBike = useUpdateBike();
  const deleteBike = useDeleteBike();

  // Front calibration state
  const [frontRows, setFrontRows] = useState<FrontRow[]>(emptyFrontRows());
  const [frontResult, setFrontResult] = useState<FrontCalibrationResult | null>(null);
  const [frontError, setFrontError] = useState<string | null>(null);
  const [selectedSlugForFront, setSelectedSlugForFront] = useState('');

  // Rear calibration state
  const [rearRows, setRearRows] = useState<RearRow[]>(emptyRearRows());
  const [rearResult, setRearResult] = useState<RearCalibrationResult | null>(null);
  const [rearError, setRearError] = useState<string | null>(null);
  const [selectedSlugForRear, setSelectedSlugForRear] = useState('');

  // Bike profile form
  const [showNewBikeForm, setShowNewBikeForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [bikeForm, setBikeForm] = useState<BikeProfile>({ ...EMPTY_BIKE });
  const [bikeError, setBikeError] = useState<string | null>(null);

  const frontMutation = useMutation({
    mutationFn: calibrateFront,
    onSuccess: setFrontResult,
    onError: (e: Error) => setFrontError(e.message),
  });

  const rearMutation = useMutation({
    mutationFn: calibrateRear,
    onSuccess: setRearResult,
    onError: (e: Error) => setRearError(e.message),
  });

  const loadFrontExample = async () => {
    try {
      const ex = await getCalibrationExamples();
      setFrontRows(
        ex.front_strokes_mm.map((s, i) => ({
          stroke_mm: String(s),
          voltage_v: String(ex.front_voltages_v[i]),
        }))
      );
    } catch {
      // silently ignore — examples are best-effort
    }
  };

  const loadRearExample = async () => {
    try {
      const ex = await getCalibrationExamples();
      setRearRows(
        ex.rear_shock_strokes_mm.map((s, i) => ({
          shock_stroke_mm: String(s),
          wheel_travel_mm: String(ex.rear_wheel_travels_mm[i]),
        }))
      );
    } catch {
      // silently ignore
    }
  };

  const handleFrontFit = () => {
    setFrontError(null);
    const valid = frontRows.filter((r) => r.stroke_mm !== '' && r.voltage_v !== '');
    if (valid.length < 2) { setFrontError('Need at least 2 valid data points'); return; }
    frontMutation.mutate({
      stroke_mm: valid.map((r) => Number(r.stroke_mm)),
      voltage_v: valid.map((r) => Number(r.voltage_v)),
    });
  };

  const handleRearFit = () => {
    setRearError(null);
    const valid = rearRows.filter((r) => r.shock_stroke_mm !== '' && r.wheel_travel_mm !== '');
    if (valid.length < 2) { setRearError('Need at least 2 valid data points'); return; }
    rearMutation.mutate({
      shock_stroke_mm: valid.map((r) => Number(r.shock_stroke_mm)),
      wheel_travel_mm: valid.map((r) => Number(r.wheel_travel_mm)),
    });
  };

  const handleApplyFront = async () => {
    if (!frontResult || !selectedSlugForFront) return;
    try {
      await updateBike.mutateAsync({ slug: selectedSlugForFront, bike: { c_front: frontResult.c_cal, v0_front: frontResult.v0 } });
    } catch (e) {
      setFrontError(e instanceof Error ? e.message : 'Failed to apply');
    }
  };

  const handleApplyRear = async () => {
    if (!rearResult || !selectedSlugForRear) return;
    try {
      await updateBike.mutateAsync({ slug: selectedSlugForRear, bike: { linkage_a: rearResult.a, linkage_b: rearResult.b, linkage_c: rearResult.c } });
    } catch (e) {
      setRearError(e instanceof Error ? e.message : 'Failed to apply');
    }
  };

  const setBikeField = (key: keyof BikeProfile, value: string | number) => {
    setBikeForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveBike = async () => {
    setBikeError(null);
    try {
      if (editingSlug) {
        await updateBike.mutateAsync({ slug: editingSlug, bike: bikeForm });
      } else {
        await createBike.mutateAsync(bikeForm);
      }
      setShowNewBikeForm(false);
      setEditingSlug(null);
      setBikeForm({ ...EMPTY_BIKE });
    } catch (e) {
      setBikeError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const handleEditBike = (b: BikeProfile) => {
    setBikeForm({ ...b });
    setEditingSlug(b.slug);
    setShowNewBikeForm(true);
  };

  const handleDeleteBike = async (slug: string) => {
    if (!confirm(`Delete bike "${slug}"?`)) return;
    try {
      await deleteBike.mutateAsync(slug);
    } catch {
      // ignore
    }
  };

  const bikeFields: Array<[keyof BikeProfile, string]> = [
    ['name', 'Name'], ['slug', 'Slug'],
    ['w_max_front_mm', 'Max front travel (mm)'], ['w_max_rear_mm', 'Max rear travel (mm)'],
    ['fork_angle_deg', 'Fork angle (°)'],
    ['c_front', 'C front'], ['v0_front', 'V0 front'],
    ['c_rear', 'C rear'], ['v0_rear', 'V0 rear'],
    ['linkage_a', 'Linkage A'], ['linkage_b', 'Linkage B'], ['linkage_c', 'Linkage C'],
    ['adc_bits', 'ADC bits'], ['v_ref', 'V ref'],
    ['fs_hz', 'Sample rate (Hz)'],
    ['lpf_cutoff_disp_hz', 'LPF disp cutoff (Hz)'], ['lpf_cutoff_gyro_hz', 'LPF gyro cutoff (Hz)'],
    ['complementary_alpha', 'Complementary α'],
    ['stationary_samples', 'Stationary samples'],
    ['gyro_sensitivity', 'Gyro sensitivity'], ['accel_sensitivity', 'Accel sensitivity'],
    ['ls_threshold_mm_s', 'LS threshold (mm/s)'],
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Calibrate</h1>

      {/* Two-column calibration panels */}
      <div className="grid grid-cols-2 gap-6">
        {/* Front Calibration */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-gray-700">Front Fork Calibration</h2>
            <button
              onClick={loadFrontExample}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Load T7 Example
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Enter stroke (mm) and voltage (V) pairs from a static calibration sweep.
          </p>

          <table className="w-full text-xs mb-2 border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="text-left py-1 pr-2">Stroke (mm)</th>
                <th className="text-left py-1">Voltage (V)</th>
              </tr>
            </thead>
            <tbody>
              {frontRows.map((row, i) => (
                <tr key={i}>
                  <td className="pr-2 py-1">
                    <input
                      className={inputCls}
                      type="number"
                      step="any"
                      value={row.stroke_mm}
                      onChange={(e) => {
                        const rows = [...frontRows];
                        rows[i] = { ...rows[i], stroke_mm: e.target.value };
                        setFrontRows(rows);
                      }}
                    />
                  </td>
                  <td className="py-1">
                    <input
                      className={inputCls}
                      type="number"
                      step="any"
                      value={row.voltage_v}
                      onChange={(e) => {
                        const rows = [...frontRows];
                        rows[i] = { ...rows[i], voltage_v: e.target.value };
                        setFrontRows(rows);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="text-xs text-orange-500 hover:text-orange-600 mb-3"
            onClick={() => setFrontRows([...frontRows, { stroke_mm: '', voltage_v: '' }])}
          >
            + Add row
          </button>

          {frontError && <p className="text-xs text-red-600 mb-2">{frontError}</p>}

          <button
            onClick={handleFrontFit}
            disabled={frontMutation.isPending}
            className="w-full py-1.5 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 disabled:opacity-50 mb-3"
          >
            {frontMutation.isPending ? 'Fitting…' : 'Fit'}
          </button>

          {frontResult && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-xs space-y-1 mb-3">
              <p><span className="font-medium">C_cal:</span> {frontResult.c_cal.toFixed(4)}</p>
              <p><span className="font-medium">V0:</span> {frontResult.v0.toFixed(4)} V</p>
              <p><span className="font-medium">RMSE:</span> {frontResult.rmse.toFixed(4)} mm</p>
            </div>
          )}

          {frontResult && (
            <div className="flex gap-2 items-center">
              <select
                value={selectedSlugForFront}
                onChange={(e) => setSelectedSlugForFront(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs"
              >
                <option value="">Select bike…</option>
                {bikes.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </select>
              <button
                onClick={handleApplyFront}
                disabled={!selectedSlugForFront}
                className="px-3 py-1 bg-gray-800 text-white rounded-md text-xs hover:bg-gray-700 disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Rear Calibration */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-gray-700">Rear Linkage Calibration</h2>
            <button
              onClick={loadRearExample}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Load T7 Example
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Enter shock stroke (mm) and wheel travel (mm) pairs from a sweep.
          </p>

          <table className="w-full text-xs mb-2 border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="text-left py-1 pr-2">Shock stroke (mm)</th>
                <th className="text-left py-1">Wheel travel (mm)</th>
              </tr>
            </thead>
            <tbody>
              {rearRows.map((row, i) => (
                <tr key={i}>
                  <td className="pr-2 py-1">
                    <input
                      className={inputCls}
                      type="number"
                      step="any"
                      value={row.shock_stroke_mm}
                      onChange={(e) => {
                        const rows = [...rearRows];
                        rows[i] = { ...rows[i], shock_stroke_mm: e.target.value };
                        setRearRows(rows);
                      }}
                    />
                  </td>
                  <td className="py-1">
                    <input
                      className={inputCls}
                      type="number"
                      step="any"
                      value={row.wheel_travel_mm}
                      onChange={(e) => {
                        const rows = [...rearRows];
                        rows[i] = { ...rows[i], wheel_travel_mm: e.target.value };
                        setRearRows(rows);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="text-xs text-orange-500 hover:text-orange-600 mb-3"
            onClick={() => setRearRows([...rearRows, { shock_stroke_mm: '', wheel_travel_mm: '' }])}
          >
            + Add row
          </button>

          {rearError && <p className="text-xs text-red-600 mb-2">{rearError}</p>}

          <button
            onClick={handleRearFit}
            disabled={rearMutation.isPending}
            className="w-full py-1.5 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 disabled:opacity-50 mb-3"
          >
            {rearMutation.isPending ? 'Fitting…' : 'Fit'}
          </button>

          {rearResult && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-xs space-y-1 mb-3">
              <p><span className="font-medium">a:</span> {rearResult.a.toFixed(6)}</p>
              <p><span className="font-medium">b:</span> {rearResult.b.toFixed(6)}</p>
              <p><span className="font-medium">c:</span> {rearResult.c.toFixed(6)}</p>
              <p><span className="font-medium">RMSE:</span> {rearResult.rmse.toFixed(4)} mm</p>
            </div>
          )}

          {rearResult && (
            <div className="flex gap-2 items-center">
              <select
                value={selectedSlugForRear}
                onChange={(e) => setSelectedSlugForRear(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs"
              >
                <option value="">Select bike…</option>
                {bikes.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </select>
              <button
                onClick={handleApplyRear}
                disabled={!selectedSlugForRear}
                className="px-3 py-1 bg-gray-800 text-white rounded-md text-xs hover:bg-gray-700 disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bike Profile Manager */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Bike Profiles</h2>
          <button
            onClick={() => { setBikeForm({ ...EMPTY_BIKE }); setEditingSlug(null); setShowNewBikeForm(true); }}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600"
          >
            + New Profile
          </button>
        </div>

        {isLoading ? (
          <p className="text-xs text-gray-400">Loading…</p>
        ) : bikes.length === 0 ? (
          <p className="text-xs text-gray-400">No bike profiles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Slug</th>
                  <th className="text-left py-2 pr-4">Front travel</th>
                  <th className="text-left py-2 pr-4">Rear travel</th>
                  <th className="text-left py-2 pr-4">Sample rate</th>
                  <th className="text-left py-2 pr-4">LS threshold</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {bikes.map((b) => (
                  <tr key={b.slug} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">{b.name}</td>
                    <td className="py-2 pr-4 font-mono text-gray-500">{b.slug}</td>
                    <td className="py-2 pr-4">{b.w_max_front_mm} mm</td>
                    <td className="py-2 pr-4">{b.w_max_rear_mm} mm</td>
                    <td className="py-2 pr-4">{b.fs_hz} Hz</td>
                    <td className="py-2 pr-4">{b.ls_threshold_mm_s} mm/s</td>
                    <td className="py-2 flex gap-2">
                      <button
                        onClick={() => handleEditBike(b)}
                        className="text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBike(b.slug)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* New/edit bike form */}
        {showNewBikeForm && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold text-gray-600 mb-3">
              {editingSlug ? `Edit: ${editingSlug}` : 'New Bike Profile'}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={inputCls}
                  type="text"
                  value={bikeForm.name}
                  onChange={(e) => setBikeField('name', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  className={inputCls}
                  type="text"
                  value={bikeForm.slug}
                  onChange={(e) => setBikeField('slug', e.target.value)}
                  disabled={!!editingSlug}
                />
              </div>
              {bikeFields.slice(2).map(([key, label]) => (
                <NumericInput
                  key={key}
                  label={label}
                  value={bikeForm[key] as number}
                  onChange={(v) => setBikeField(key, v)}
                />
              ))}
            </div>

            {bikeError && <p className="text-xs text-red-600 mt-2">{bikeError}</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveBike}
                className="px-4 py-1.5 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600"
              >
                Save
              </button>
              <button
                onClick={() => { setShowNewBikeForm(false); setEditingSlug(null); }}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
