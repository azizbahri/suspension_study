import { X } from 'lucide-react';

export type CalibrateInfoKey =
  // Calibration table inputs
  | 'front_stroke'
  | 'front_voltage'
  | 'rear_shock_stroke'
  | 'rear_wheel_travel'
  // Calibration result values
  | 'result_c_cal'
  | 'result_v0'
  | 'result_rmse_front'
  | 'result_a'
  | 'result_b'
  | 'result_c'
  | 'result_rmse_rear'
  // Bike profile fields
  | 'name'
  | 'slug'
  | 'w_max_front_mm'
  | 'w_max_rear_mm'
  | 'fork_angle_deg'
  | 'c_front'
  | 'v0_front'
  | 'c_rear'
  | 'v0_rear'
  | 'linkage_a'
  | 'linkage_b'
  | 'linkage_c'
  | 'adc_bits'
  | 'v_ref'
  | 'fs_hz'
  | 'lpf_cutoff_disp_hz'
  | 'lpf_cutoff_gyro_hz'
  | 'complementary_alpha'
  | 'stationary_samples'
  | 'gyro_sensitivity'
  | 'accel_sensitivity'
  | 'ls_threshold_mm_s';

interface FieldInfo {
  title: string;
  description: string;
  where: string;
  related: string[];
}

const FIELD_INFO: Record<CalibrateInfoKey, FieldInfo> = {
  // ── Calibration table inputs ────────────────────────────────────────────────

  front_stroke: {
    title: 'Fork Stroke (mm)',
    description:
      'Linear displacement of the fork stanchion from full extension (0 mm) to full compression. Each row records the shaft position at a known point during a static sweep from open to closed.',
    where:
      'Measure with a ruler or digital caliper from a fixed reference on the outer tube to the wiper seal. A zip-tied travel indicator on the fork leg is the most practical approach on the bike.',
    related: [
      'Paired with Voltage (V) in the same row — the two columns together define one calibration point.',
      'The slope of the fitted line becomes C_front (mm/V) in the bike profile.',
      'Real-time stroke = C_front × (ADC_voltage − V0_front). An evenly spaced sweep from 0 mm to full stroke gives the best fit quality.',
    ],
  },

  front_voltage: {
    title: 'Sensor Voltage (V)',
    description:
      'Raw output voltage from the front displacement sensor (typically a linear potentiometer or Hall-effect device) at the corresponding fork stroke position.',
    where:
      'Read from the DAQ while the bike is powered and the DAQ is logging. Hold the fork at each calibration point and note the reported voltage. If only raw ADC counts are available: V = count × V_ref / 2^ADC_bits.',
    related: [
      'Paired with Stroke (mm) in the same row.',
      'V0_front is the voltage at 0 mm — the y-intercept of the fitted line.',
      'The slope of voltage vs. stroke gives C_front. A non-linear voltage response across the stroke indicates a worn potentiometer or Hall-effect sensor with limited linear range.',
    ],
  },

  rear_shock_stroke: {
    title: 'Shock Stroke (mm)',
    description:
      'Linear displacement of the rear shock shaft from full extension (0 mm = shock fully open) to successively compressed positions used to map shock stroke to wheel travel.',
    where:
      'Measure the shock shaft displacement with a caliper from the clevis-end seal face. A shock dyno or a zip-tied travel gauge fixed to the shaft gives the most repeatable results. Compress the shock by pushing down on the subframe while the wheel is off the ground.',
    related: [
      'Paired with Wheel Travel (mm) in the same row.',
      'The quadratic polynomial fit across all rows produces linkage_a, linkage_b, linkage_c.',
      'Ensure the first point starts at 0 mm (full extension) to keep linkage_c near zero.',
    ],
  },

  rear_wheel_travel: {
    title: 'Wheel Travel (mm)',
    description:
      'Vertical displacement of the rear axle at the same position as the shock stroke reading in the same row. Captures the real-world motion ratio of the rear linkage.',
    where:
      'Measure from a fixed horizontal reference (e.g. a flat workbench surface) to the axle centreline using a tape measure or a string potentiometer anchored at the axle. Each wheel travel reading must be simultaneous with the corresponding shock stroke reading.',
    related: [
      'The ratio wheel_travel / shock_stroke is the instantaneous motion ratio at that point.',
      'linkage_b ≈ average motion ratio across the stroke. linkage_a captures the progressive/regressive curvature.',
      'Effective spring rate at the wheel: k_wheel = k_shock / linkage_b². A higher motion ratio means the wheel spring rate is much softer than the coil spring rating.',
    ],
  },

  // ── Calibration results ─────────────────────────────────────────────────────

  result_c_cal: {
    title: 'C_cal — Calibration Gain (mm/V)',
    description:
      'The slope of the linear fit between fork stroke and sensor voltage: stroke_mm = C_cal × (V − V0). Dimensionally it is millimetres per volt. This value is written to C_front in the selected bike profile when you click Apply.',
    where:
      'Computed automatically from your data points. No physical measurement needed — it is the output of the linear regression.',
    related: [
      'Used together with V0 at run time: stroke = C_front × (ADC_voltage − V0_front).',
      'RMSE shows how well this linear model fits your data. A high RMSE (> 1.5 mm) suggests a non-linear sensor, cable slack, or measurement errors.',
      'If you change V_ref or ADC_bits in the firmware, the calibration must be redone because the raw voltage mapping changes.',
    ],
  },

  result_v0: {
    title: 'V0 — Zero-Stroke Voltage (V)',
    description:
      'The sensor voltage when the fork is fully extended (0 mm stroke). Computed as the y-intercept of the linear fit. Written to V0_front in the bike profile when you click Apply.',
    where:
      'Also readable directly from the DAQ when the fork is fully extended and the wheel is unloaded (lifted off the ground). Verify this value against a direct DAQ reading after applying.',
    related: [
      'Paired with C_front. A systematic error in V0 causes a constant stroke offset in every frame of the session.',
      'If the fork voltage at full extension reads slightly non-zero on the DAQ, that is expected — V0_front corrects for it.',
      'V0_front should be stable over time. Drift suggests a loose potentiometer connection or temperature sensitivity.',
    ],
  },

  result_rmse_front: {
    title: 'RMSE — Fit Residual (mm)',
    description:
      'Root-mean-square deviation of the linear fit from the measured data points, in millimetres. Indicates how cleanly the sensor output follows a straight line across the stroke.',
    where:
      'Computed automatically. No measurement needed.',
    related: [
      'Below 0.5 mm: excellent — the sensor is highly linear.',
      '0.5–1.5 mm: acceptable for most applications.',
      'Above 1.5 mm: re-check sensor mounting, cable routing, and whether the potentiometer track is worn. Non-linear sensors may need a polynomial fit (contact manufacturer for linearisation data).',
    ],
  },

  result_a: {
    title: 'Linkage a — Quadratic Coefficient',
    description:
      'Quadratic term in the rear linkage polynomial: wheel_travel = a·s² + b·s + c. A non-zero value means the motion ratio changes across the shock stroke: progressive (a > 0, motion ratio increases with compression) or regressive (a < 0). Written to linkage_a.',
    where:
      'Computed automatically by the polynomial regression. Also obtainable from a linkage geometry simulation tool (e.g., Linkage X, MXStore calculator) if you have the pivot measurements.',
    related: [
      'On simple linkages with a near-constant motion ratio, a ≈ 0 and b dominates.',
      'linkage_b is the dominant term — verify it matches the manufacturer-stated motion ratio.',
      'A large quadratic term affects how the damper velocity histogram is scaled at different travel depths.',
    ],
  },

  result_b: {
    title: 'Linkage b — Linear Coefficient (motion ratio)',
    description:
      'Linear term in the rear linkage polynomial. On a nearly-constant motion-ratio linkage, b ≈ the average motion ratio (mm of wheel travel per mm of shock stroke). Typical enduro/trail bikes: 3.0–4.5. Written to linkage_b.',
    where:
      'Computed automatically. Cross-check against the manufacturer workshop manual or the linkage specification sheet which often lists the motion ratio directly.',
    related: [
      'Effective spring rate at the wheel: k_wheel = k_spring / b². A linkage ratio of 3.5 means the wheel spring rate is 12× softer than the spring rating.',
      'This value directly scales the rear shock stroke to wheel travel in the processing pipeline.',
      'If b is very different from the manufacturer spec, re-check that wheel travel was measured at the axle (not the swingarm pivot).',
    ],
  },

  result_c: {
    title: 'Linkage c — Constant Offset (mm)',
    description:
      'Constant term in the rear linkage polynomial. Should be close to 0 mm if the first calibration point was taken at full shock extension (0 mm stroke → 0 mm wheel travel). Written to linkage_c.',
    where:
      'Computed automatically. If significantly non-zero (> 5 mm), re-check that the first shock stroke row in the table is truly at full extension.',
    related: [
      'A non-zero c introduces a constant offset into all rear travel readings, shifting the histogram left or right.',
      'If the shock cannot be fully extended on the bike, ensure you subtract the offset from all other measurements to restore the 0-based reference.',
      'Unlike linkage_a and linkage_b, linkage_c carries no physical suspension geometry meaning — treat it purely as a calibration correction.',
    ],
  },

  result_rmse_rear: {
    title: 'RMSE — Fit Residual (mm)',
    description:
      'Root-mean-square deviation of the quadratic polynomial fit from the measured wheel travel data, in millimetres. Lower is better.',
    where:
      'Computed automatically.',
    related: [
      'Below 1 mm: excellent for a quadratic fit.',
      '1–3 mm: acceptable for most linkage geometries.',
      'Above 3 mm: the linkage may have a complex (higher-order) geometry, or there are measurement errors. Adding more calibration points spread evenly across the full stroke often helps.',
    ],
  },

  // ── Bike profile fields ─────────────────────────────────────────────────────

  name: {
    title: 'Profile Name',
    description:
      'Human-readable display name for this bike profile. Appears in dropdown selectors, the session import page, and the analysis header.',
    where:
      'Choose any descriptive name when creating the profile (e.g., "KTM 300 EXC 2023", "Ténéré 700 Trail Setup"). The name can be changed at any time.',
    related: [
      'The slug is the machine-readable ID set separately from the name.',
      'The name appears in the analysis header so descriptive names help when comparing multiple sessions.',
    ],
  },

  slug: {
    title: 'Profile Slug (machine ID)',
    description:
      'Unique machine-readable identifier for this bike profile. Used in API calls, file paths, and URL parameters. Must be lowercase alphanumeric with underscores (no spaces or special characters). Cannot be changed after creation.',
    where:
      'Set when creating the profile. Convention: lowercase_with_underscores (e.g., "ktm_300_exc", "t7_trail"). Derive it from the bike name.',
    related: [
      'All sessions and calibration data reference the slug internally. Renaming a slug would break historical references.',
      'The slug appears in the URL when navigating to analysis results for a session that uses this profile.',
    ],
  },

  w_max_front_mm: {
    title: 'Max Front Wheel Travel (mm)',
    description:
      'Maximum theoretical front wheel travel from full extension to full compression, in millimetres. This is the denominator in the front travel histogram: a bar at 100% means the fork reached full stroke.',
    where:
      'Manufacturer specification sheet under "suspension travel" or "fork travel". Alternatively, remove the fork and measure shaft travel from full extension to bottoming. Typical enduro: 250–310 mm.',
    related: [
      'Setting this too low makes the histogram show impossible values (> 100%).',
      'Setting this too high compresses the histogram and makes the sag percentage appear artificially low.',
      'The complementary parameter on the rear is w_max_rear_mm.',
    ],
  },

  w_max_rear_mm: {
    title: 'Max Rear Wheel Travel (mm)',
    description:
      'Maximum theoretical rear wheel travel from full extension to full compression, in millimetres. Denominator for the rear travel histogram.',
    where:
      'Manufacturer specification. Note: this is wheel travel at the axle, not shock stroke. Multiply max shock stroke by linkage_b to get an approximation, or measure directly with a string potentiometer at the axle.',
    related: [
      'Pairs with linkage_b — if the motion ratio changes with stroke (linkage_a non-zero), use a direct wheel travel measurement rather than the calculated estimate.',
      'A common mistake is to enter shock stroke here instead of wheel travel. The histogram scale will be wrong by a factor of ~linkage_b.',
    ],
  },

  fork_angle_deg: {
    title: 'Fork Angle / Head Angle (°)',
    description:
      'Angle of the fork stanchion axis measured from vertical. Used to project fork stroke (along the stanchion axis) into vertical wheel travel: w_vertical = stroke × cos(fork_angle_deg).',
    where:
      'Manufacturer geometry specification page, usually listed as "head angle" or "fork angle". Measure physically with a digital inclinometer placed on the lower fork leg if the spec is unavailable. Typical enduro/trail: 25–29°.',
    related: [
      'A 27.5° angle applies a cos(27.5°) ≈ 0.887 correction. Without this, the front travel histogram would over-read by ~12%.',
      'Slacker bikes (larger angle) have a bigger correction factor. Steeper race bikes have less correction.',
      'Changes in fork angle due to respringing or ride height adjustments require updating this value.',
    ],
  },

  c_front: {
    title: 'Front Sensor Gain C_front (mm/V)',
    description:
      'Linear calibration gain for the front displacement sensor: stroke_mm = C_front × (ADC_voltage − V0_front). Units are mm per volt. This is the primary output of the Front Fork Calibration routine.',
    where:
      'Set automatically by running the Front Fork Calibration tool on this page and clicking Apply. Can be entered manually if the sensor datasheet provides a mm/V sensitivity figure.',
    related: [
      'Paired with V0_front. Both must be set from the same calibration session.',
      'If you replace the sensor or change V_ref in the firmware, the calibration must be redone.',
      'A rough sanity check: C_front × V_ref should approximately equal max fork stroke.',
    ],
  },

  v0_front: {
    title: 'Front Zero Voltage V0_front (V)',
    description:
      'ADC output voltage when the front fork is fully extended (0 mm stroke). Acts as the offset in the front calibration equation: stroke = C_front × (V − V0_front).',
    where:
      'Set automatically by the Front Fork Calibration. Readable directly from the DAQ with the fork unloaded and fully extended (wheel off the ground).',
    related: [
      'An incorrect V0_front causes a constant stroke offset across every reading in the session.',
      'Validate by checking that the reported stroke is near 0 mm when the bike is unloaded and the fork is fully extended.',
      'V0_front should not drift significantly over time. A drift > 0.02 V may indicate a connector issue or sensor wear.',
    ],
  },

  c_rear: {
    title: 'Rear Sensor Gain C_rear',
    description:
      'Linear scale factor applied to the raw rear sensor signal before it enters the quadratic linkage polynomial. For most setups using a potentiometer whose output is already in mm, leave this at 1.0.',
    where:
      'Check sensor datasheet. If the rear sensor output is in volts, set C_rear = stroke_mm / V_max. If the linkage calibration was done with the sensor output already converted to mm, C_rear = 1.0.',
    related: [
      'Multiplied into the shock reading before applying linkage_a, b, c.',
      'Adjust only if the rear sensor has a different physical range than assumed during the linkage calibration sweep.',
      'An incorrect C_rear scales all rear travel readings proportionally and shifts both the histogram and diagnostics.',
    ],
  },

  v0_rear: {
    title: 'Rear Zero Voltage V0_rear (V)',
    description:
      'ADC output voltage when the rear shock is fully extended (0 mm shock stroke). Offset applied to the raw voltage before C_rear and the linkage polynomial are applied.',
    where:
      'Read from the DAQ with the shock fully extended and the rear wheel unloaded (lifted).',
    related: [
      'Analogous to V0_front on the rear side.',
      'An incorrect V0_rear introduces a constant wheel-travel offset, shifting the rear histogram left or right.',
      'Verify: reported wheel travel should be approximately 0 mm with the shock fully extended.',
    ],
  },

  linkage_a: {
    title: 'Linkage A — Quadratic Coefficient',
    description:
      'Quadratic coefficient in the rear linkage polynomial: wheel_travel = A·s² + B·s + C. Captures whether the motion ratio changes across the stroke: positive A = progressive (stiffens toward full compression), negative A = regressive (softens).',
    where:
      'Set automatically by the Rear Linkage Calibration on this page. Also obtainable from a linkage geometry simulation tool (e.g., Linkage X) if you have measured pivot positions.',
    related: [
      'On simple single-pivot linkages A ≈ 0 and B dominates.',
      'Horst-link, VPP, and DW-link designs often have meaningful quadratic terms due to their progressive geometry.',
      'The effective spring rate at the wheel is k_wheel = k_spring / (A·s + B/2)² approximately — the motion ratio varies with travel depth when A ≠ 0.',
    ],
  },

  linkage_b: {
    title: 'Linkage B — Motion Ratio',
    description:
      'Linear coefficient in the rear linkage polynomial. On a nearly-constant-ratio linkage, B is the average motion ratio (mm of wheel travel per mm of shock stroke). Typical enduro/trail bikes: 3–4.5.',
    where:
      'Set by Rear Linkage Calibration. Cross-check with the manufacturer workshop manual, which often specifies the motion ratio. Also available from factory linkage geometry data or simulation tools.',
    related: [
      'Effective spring rate at the wheel: k_wheel = k_spring / B². A ratio of 3.5 means the spring rate felt at the wheel is ~12× lower than the coil rating.',
      'This value directly scales the real-time shock stroke to estimated wheel travel in the processing pipeline.',
      'If B differs significantly from the factory spec (> 0.2), verify that wheel travel was measured at the axle and that the shock stroke measurement started at full extension.',
    ],
  },

  linkage_c: {
    title: 'Linkage C — Constant Offset',
    description:
      'Constant term in the rear linkage polynomial: wheel_travel = A·s² + B·s + C. Should be close to 0 mm when the calibration started from full shock extension (s = 0 → wheel travel = 0).',
    where:
      'Set by Rear Linkage Calibration. If the value is significantly non-zero (> 5 mm), re-check that the first calibration row is taken at full shock extension.',
    related: [
      'A non-zero C shifts all rear travel readings by a constant amount, moving the entire histogram.',
      'Unlike A and B, C has no physical suspension geometry meaning — treat it as a calibration correction term.',
      'If the shock cannot reach full extension on the bike, measure at the closest point and note the offset.',
    ],
  },

  adc_bits: {
    title: 'ADC Resolution (bits)',
    description:
      'Bit depth of the analog-to-digital converter in the DAQ firmware. Determines the voltage quantisation step size: ΔV = V_ref / 2^bits. Example: 12 bits + 3.3 V → ~0.8 mV per count → ~0.07 mm per count at a typical front sensor sensitivity.',
    where:
      'DAQ firmware source code, microcontroller datasheet, or hardware schematic. Common values: 10 bits (Arduino Uno), 12 bits (ESP32, STM32F4), 16 bits (precision DAQ boards).',
    related: [
      'Together with V_ref, sets the absolute voltage resolution of both sensors.',
      'Must match exactly what the firmware uses. A mismatch causes a systematic gain error proportional to 2^(actual_bits − profile_bits).',
      'Higher ADC resolution is only useful if the sensor has similarly low noise. A noisy potentiometer at 10 bits of actual noise does not benefit from 16-bit ADC.',
    ],
  },

  v_ref: {
    title: 'ADC Reference Voltage V_ref (V)',
    description:
      'Full-scale reference voltage of the ADC. All ADC count values span from 0 to V_ref. Common values: 3.3 V (ESP32, STM32), 5.0 V (Arduino Uno/Mega).',
    where:
      'Hardware schematic or microcontroller documentation. Measure with a multimeter at the VREF/AVCC pin if uncertain. Some boards regulate V_ref separately from VCC.',
    related: [
      'Paired with adc_bits. Computed voltage = (count / 2^adc_bits) × v_ref.',
      'Changing V_ref (e.g., switching from 5 V to 3.3 V) changes the raw voltage values read by the ADC, invalidating the calibration. Redo the Front Fork Calibration after any V_ref change.',
      'V_ref also determines the maximum sensor voltage that can be read. Ensure the sensor output does not exceed V_ref at full stroke.',
    ],
  },

  fs_hz: {
    title: 'Sampling Frequency fs (Hz)',
    description:
      'Data acquisition rate — how many sensor readings are captured per second. Must match the firmware logging rate exactly, or all velocity and frequency calculations will be incorrect.',
    where:
      'DAQ firmware source code or configuration file. Verify with a timing measurement: log a known waveform (e.g., 1 Hz oscillation) and count samples per cycle. Typical suspension logging: 100–500 Hz.',
    related: [
      'Determines time resolution. Below 100 Hz, sharp impacts (< 10 ms) may be missed.',
      'The LPF cutoff frequencies (lpf_cutoff_disp_hz, lpf_cutoff_gyro_hz) must be below fs / 2 (the Nyquist limit). At 200 Hz sampling, the maximum useful cutoff is 100 Hz.',
      'Higher fs also increases file size and processing time proportionally.',
    ],
  },

  lpf_cutoff_disp_hz: {
    title: 'Displacement LPF Cutoff (Hz)',
    description:
      'Cutoff frequency of the Butterworth low-pass filter applied to fork and shock displacement signals before computing velocity and histograms. Removes high-frequency sensor noise above this frequency.',
    where:
      'Tuned empirically. A good starting point is 20 Hz for most enduro/trail applications. Lower (10–15 Hz) for very noisy sensors; higher (25–40 Hz) if you want sharper temporal resolution on impacts.',
    related: [
      'Must be below fs / 2. At 200 Hz sampling, max useful cutoff is 100 Hz.',
      'Also affects velocity (dW/dt) — a lower cutoff smooths the velocity histogram and reduces noise in the LS/HS split.',
      'Paired with lpf_cutoff_gyro_hz, which filters the pitch-rate signal independently.',
    ],
  },

  lpf_cutoff_gyro_hz: {
    title: 'Gyroscope LPF Cutoff (Hz)',
    description:
      'Cutoff frequency of the low-pass filter applied to the gyroscope pitch-rate signal before integration in the complementary filter. Removes vibration noise from the IMU above this frequency.',
    where:
      'Tuned empirically. Typical: 25–40 Hz for motorcycle dynamics. Too low (< 15 Hz) → sluggish pitch response that misses braking events. Too high → vibration artifacts appear in the pitch trace.',
    related: [
      'Must be below fs / 2.',
      'The filtered gyro signal feeds directly into the complementary filter alongside the accelerometer tilt estimate.',
      'A gyro cutoff that is significantly lower than lpf_cutoff_disp_hz may cause the pitch trace to lag displacement events.',
    ],
  },

  complementary_alpha: {
    title: 'Complementary Filter α',
    description:
      'Mixing coefficient for the pitch-angle complementary filter: φ[n] = α × (φ[n−1] + ω_gyro × dt) + (1−α) × φ_accel. α near 1 relies heavily on gyro integration (accurate during motion, drifts over long sessions). α near 0 relies on the accelerometer gravity reference (free from drift, but corrupted by lateral acceleration).',
    where:
      'Tuned empirically. The project default of 0.98 is well-validated for suspension logging durations of seconds to minutes. Adjust only if you observe significant pitch drift on long flat sections.',
    related: [
      'Requires correct gyro_sensitivity and accel_sensitivity to produce accurate physical units.',
      'At α = 0.98, the filter time constant is approximately 1 / ((1−0.98) × fs) seconds. At 200 Hz: τ ≈ 0.25 s.',
      'During hard braking the accelerometer signal is contaminated by longitudinal deceleration — the gyro term (controlled by α) maintains pitch accuracy in these moments.',
    ],
  },

  stationary_samples: {
    title: 'Stationary Bias Samples',
    description:
      'Number of consecutive samples at the start of the recording used to estimate and remove the gyroscope zero-rate offset (bias). The bike must be completely still for this many samples after power-on.',
    where:
      'Set to match the firmware startup requirement. At 200 Hz, 200 samples = 1 second of stillness. Confirm with firmware documentation or the DAQ startup sequence.',
    related: [
      'A short window (< 50 samples) risks a noisy bias estimate, causing a slow pitch drift throughout the session.',
      'Gyro bias is subtracted before the complementary filter runs — this is the first step in the pitch processing pipeline.',
      'If the bike moves before the bias window ends, the entire session pitch output will be systematically offset.',
    ],
  },

  gyro_sensitivity: {
    title: 'Gyroscope Sensitivity (LSB/°/s)',
    description:
      'Conversion factor from raw 16-bit IMU counts to angular rate in °/s, as specified in the IMU datasheet for the configured full-scale range.',
    where:
      'IMU datasheet, sensitivity table for the full-scale range configured in the IMU register. Common MPU-6050 values: 131 LSB/°/s at ±250 °/s, 65.5 at ±500 °/s, 32.8 at ±1000 °/s, 16.4 at ±2000 °/s.',
    related: [
      'Must match the full-scale range selected in the IMU configuration register (FS_SEL bits). A mismatch scales the gyro contribution to the complementary filter incorrectly.',
      'A wrong sensitivity value causes the integrated pitch angle to grow or shrink relative to reality by the ratio of the correct vs. entered sensitivity.',
      'Pairs with accel_sensitivity — both must be correct for the complementary filter to produce accurate angles.',
    ],
  },

  accel_sensitivity: {
    title: 'Accelerometer Sensitivity (LSB/g)',
    description:
      'Conversion factor from raw 16-bit IMU counts to acceleration in g, as specified in the IMU datasheet for the configured full-scale range.',
    where:
      'IMU datasheet. Common MPU-6050 values: 16384 LSB/g at ±2 g, 8192 at ±4 g, 4096 at ±8 g, 2048 at ±16 g. For enduro use, ±4 g or ±8 g is recommended to capture hard braking without clipping.',
    related: [
      'Used to compute the accelerometer-based tilt estimate (gravity reference) fed into the complementary filter.',
      'Must match the AFS_SEL register setting in the IMU firmware. A mismatch scales the gravity reference incorrectly, shifting the steady-state pitch angle.',
      'Pairs with gyro_sensitivity. Both must be set correctly before the complementary filter output is meaningful.',
    ],
  },

  ls_threshold_mm_s: {
    title: 'Low/High Speed Threshold (mm/s)',
    description:
      'Damper shaft velocity threshold separating the low-speed (LS) and high-speed (HS) damping zones in the velocity histogram and diagnostic checks. Typically 75–200 mm/s for modern enduro/trail dampers.',
    where:
      'Determined by your suspension setup. Check the damper manufacturer\'s damping force curve or adjuster specification — the LS/HS crossover is where the check valve opens. Common values: WP XACT = 80 mm/s, Fox FLOAT X = 100–150 mm/s, Öhlins TTX = 100–120 mm/s.',
    related: [
      'Affects how the velocity histogram is split: LS-Compression, HS-Compression, LS-Rebound, HS-Rebound percentages all change with this threshold.',
      'Using the same threshold for front and rear makes the LS/HS percentages directly comparable between ends.',
      'A higher threshold (200 mm/s) means more events are classified as LS — useful for comparing setups tuned specifically for body-motion control.',
    ],
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  activeKey: CalibrateInfoKey | null;
  onClose: () => void;
}

export default function CalibrateInfoSidebar({ activeKey, onClose }: Props) {
  const info = activeKey ? FIELD_INFO[activeKey] : null;
  const isOpen = activeKey !== null;

  return (
    <>
      {/* Transparent backdrop — clicking closes the sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={onClose}
          aria-hidden="true"
          data-testid="calibrate-sidebar-backdrop"
        />
      )}

      {/* Sidebar panel */}
      <aside
        aria-label="Field details"
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-30 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 leading-tight">
            {info ? info.title : 'Field Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close field details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {info ? (
            <>
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  What this is
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{info.description}</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Where to find it
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{info.where}</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Related fields
                </h3>
                <ul className="space-y-2">
                  {info.related.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">·</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Click an info button next to a field to see detailed guidance.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
