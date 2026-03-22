# Chassis Pitch Angle Estimation for Suspension DAQ: Gyroscope Integration, Bias Control, and Practical Implementation

## Abstract

This report expands Section 2.3 of [overview.md](overview.md) by formalizing how chassis pitch angle is estimated from IMU data in a motorcycle suspension DAQ system. The objective is to explain what pitch angle means physically, why integration of gyroscope pitch rate appears in the governing equation, and how that angle is obtained from sampled DAQ measurements in practice. Particular attention is given to coordinate definitions, sensor bias, numerical integration, and drift, because those effects strongly influence the reliability of any pitch-based interpretation of braking and acceleration events.

---

## 1. Introduction

Pitch angle describes the rotation of the motorcycle chassis about its lateral axis. In suspension analysis, this angle is a compact measure of longitudinal load transfer. During braking, the chassis tends to rotate nose-down. During acceleration, it tends to rotate nose-up. Observing pitch angle together with suspension travel and longitudinal acceleration helps identify whether the front and rear systems are controlling weight transfer effectively.

The overview expresses pitch angle as

$$
\phi(t) = \int_0^t \omega_y(\tau) \, d\tau
$$

where $\omega_y$ is the IMU pitch-rate channel. This is the continuous-time kinematic relationship between angular rate and angular position.

---

## 2. Physical Meaning of Pitch Angle

Pitch angle is the orientation of the motorcycle body relative to a chosen reference frame. If the chassis rotates about its lateral axis, the pitch angle changes. In practical terms:

- negative pitch may represent braking-induced nose-down rotation,
- positive pitch may represent acceleration-induced nose-up rotation,
- the exact sign depends on the coordinate convention adopted by the IMU installation and analysis software.

Pitch angle is useful because it captures the chassis response to load transfer directly, rather than only inferring it from front and rear suspension displacement.

---

## 3. Why Integration Appears in the Formula

Angular rate is the time derivative of angular position. If $\phi(t)$ denotes pitch angle, then

$$
\omega_y(t) = \frac{d\phi}{dt}
$$

Rearranging gives

$$
d\phi = \omega_y(t) \, dt
$$

Integrating both sides from the initial time to time $t$ yields

$$
\phi(t) - \phi(0) = \int_0^t \omega_y(\tau) \, d\tau
$$

so that the full expression is

$$
\phi(t) = \phi(0) + \int_0^t \omega_y(\tau) \, d\tau
$$

The overview omits the initial condition $\phi(0)$, which is acceptable if pitch angle is defined relative to the starting posture or if the signal has been zeroed at the beginning of the run.

This explains the formula directly: gyroscopes measure angular velocity, and angular position is obtained by integrating angular velocity over time.

---

## 4. How Pitch Angle Is Attained from DAQ Data

The DAQ logger does not usually output pitch angle directly. It records raw IMU measurements, which must be converted and processed.

### 4.1 Practical Signal Chain

The pitch-estimation chain is

$$
\text{ADC counts or IMU words} \rightarrow \omega_{raw} \rightarrow \omega_y \rightarrow \omega_{y,f} \rightarrow \phi
$$

where:

- the first stage is the raw digital sensor output,
- $\omega_{raw}$ is the unscaled angular-rate measurement,
- $\omega_y$ is the calibrated pitch-rate signal in physical units,
- $\omega_{y,f}$ is the filtered and bias-corrected pitch-rate signal,
- $\phi$ is the estimated pitch angle.

### 4.2 Convert Raw IMU Data to Angular Rate

If the sensor provides signed digital counts $g_n$ with gyroscope sensitivity $K_g$ in counts per degree per second, then the physical angular rate is

$$
\omega_{y,n}^{(deg/s)} = \frac{g_n - g_0}{K_g}
$$

where $g_0$ is the zero-rate offset measured during a stationary calibration period.

If the analysis is performed in radians per second, then

$$
\omega_{y,n}^{(rad/s)} = \omega_{y,n}^{(deg/s)} \cdot \frac{\pi}{180}
$$

### 4.3 Bias Removal

Gyroscopes exhibit bias, meaning they may report a non-zero angular rate even when the bike is not rotating. If this bias is not removed before integration, pitch angle will drift over time.

Let the measured signal be

$$
\omega_{meas}(t) = \omega_{true}(t) + b + n(t)
$$

where:

- $b$ is gyroscope bias,
- $n(t)$ is measurement noise.

Then the integrated estimate becomes

$$
\phi_{meas}(t) = \phi(0) + \int_0^t \omega_{true}(\tau) \, d\tau + bt + \int_0^t n(\tau) \, d\tau
$$

The term $bt$ grows linearly with time, which is why even a small bias produces noticeable drift. A stationary zero-rate calibration before the run is therefore essential.

### 4.4 Filtering and Integration

After scaling and bias removal, the rate signal is often low-pass filtered to suppress high-frequency IMU noise before integration:

$$
\omega_{y,f}(t) = \operatorname{LPF}\{\omega_y(t)\}
$$

The pitch estimate is then

$$
\phi(t) = \phi(0) + \int_0^t \omega_{y,f}(\tau) \, d\tau
$$

The filter cutoff should be chosen so that genuine chassis pitch motion is retained while high-frequency vibration from the engine, terrain, and frame is attenuated.

---

## 5. Discrete-Time Integration for DAQ Data

Because the logger samples the gyroscope at discrete times, the integral must be approximated numerically.

Let the sample interval be $\Delta t$ and the filtered pitch-rate samples be $\omega_{y,n}$. Then the simplest forward accumulation is

$$
\phi_n = \phi_{n-1} + \omega_{y,n} \Delta t
$$

with initial value $\phi_0$.

This is the rectangular-rule integrator. A more accurate trapezoidal update is

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,n} + \omega_{y,n-1}}{2} \Delta t
$$

For offline analysis, the trapezoidal form is usually preferred because it reduces numerical integration error while remaining simple to implement.

If the DAQ runs at 250 Hz, then

$$
\Delta t = 0.004 \text{ s}
$$

and the trapezoidal update becomes

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,n} + \omega_{y,n-1}}{2} \cdot 0.004
$$

with angle units matching the units of $\omega_y$.

---

## 6. Coordinate-System and Mounting Considerations

The gyroscope channel used for pitch must correspond to the motorcycle's lateral axis in the installed IMU orientation. This is not guaranteed by the sensor's factory axis labels once the unit is mounted on the bike.

The following checks are required:

- identify the IMU axis aligned with the motorcycle's lateral axis,
- verify the sign so that braking and acceleration produce the expected direction of pitch-rate response,
- ensure the IMU is mounted rigidly to the chassis near the center of gravity.

If the IMU is misaligned, the measured pitch-rate channel may contain components of roll or yaw. In that case, a coordinate transformation using the sensor mounting matrix is required before integration.

---

## 7. Why Drift Is the Main Practical Limitation

Pure gyroscope integration is simple, but it suffers from drift. Even after zero-rate calibration, small residual bias and noise accumulate over time.

In long runs, this means the estimated pitch angle can slowly wander away from the true chassis angle even when the motorcycle returns to a neutral posture. For short braking and acceleration events, the method is still useful, but the user should interpret slowly varying baseline shifts with caution.

The basic drift mechanism is visible in the integrated bias term:

$$
\phi_{drift}(t) = bt
$$

Thus, reducing bias is more important than reducing instantaneous noise for long-horizon angle estimation.

---

## 8. Practical Methods to Improve Pitch Estimates

Several measures improve the robustness of pitch-angle estimation from DAQ data:

1. Perform a stationary bias calibration before each ride.
2. Filter the gyroscope signal before integration.
3. Zero the initial angle at a known reference posture.
4. Restrict interpretation to transient events if no external attitude reference is available.
5. Fuse gyroscope data with accelerometer-derived attitude estimates when long-term angle stability is required.

If sensor fusion is used, a complementary filter or Kalman filter can combine the short-term responsiveness of the gyroscope with the long-term reference provided by gravity-sensitive accelerometer measurements.

---

## 9. Example Using a 250 Hz DAQ Sample Rate

Assume the filtered pitch-rate samples are recorded in degrees per second at 250 Hz, with

$$
\Delta t = 0.004 \text{ s}
$$

If two consecutive samples are

$$
\omega_{y,n-1} = -12.0^\circ/\text{s}
$$

and

$$
\omega_{y,n} = -14.0^\circ/\text{s}
$$

then the trapezoidal pitch increment over one sample is

$$
\Delta \phi_n = \frac{-14.0 + (-12.0)}{2} \cdot 0.004 = -0.052^\circ
$$

This corresponds to a small nose-down pitch increment during braking.

---

## 10. Recommended Implementation Workflow

For DAQ post-processing, the recommended sequence is:

1. Read the raw gyroscope channel and timestamps.
2. Convert digital counts to physical angular rate.
3. Estimate and subtract zero-rate bias.
4. Apply a low-pass filter to the pitch-rate signal.
5. Integrate the filtered signal numerically.
6. Set the initial pitch reference according to the desired datum.
7. Validate the sign convention against known braking and acceleration events.

In compact form,

$$
g_n \rightarrow \omega_{y,n} \rightarrow \omega_{y,f,n} \rightarrow \phi_n
$$

with trapezoidal integration given by

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2} \Delta t
$$

---

## 11. Conclusion

The pitch-angle equation in the overview is the direct consequence of rotational kinematics: pitch rate is the time derivative of pitch angle, so pitch angle is obtained by integrating pitch rate over time. In a DAQ system, this means converting raw gyroscope output into physical angular rate, removing bias, filtering the signal, and applying numerical integration sample by sample.

The method is effective for identifying braking dive and acceleration squat behavior, but its accuracy depends strongly on axis alignment, bias control, and drift management. For short dynamic events, gyroscope integration is usually adequate. For longer recordings or higher-accuracy attitude estimation, gyroscope integration should be stabilized with an external reference or sensor-fusion method.

---

## Appendix A. Example Python Implementation

The following example shows one practical way to bias-correct, filter, and integrate a pitch-rate channel in Python for offline DAQ analysis.

```python
import numpy as np
from scipy.signal import butter, filtfilt


def butter_lowpass_filter(signal, sample_rate_hz, cutoff_hz, order=2):
	nyquist_hz = 0.5 * sample_rate_hz
	normalized_cutoff = cutoff_hz / nyquist_hz
	b, a = butter(order, normalized_cutoff, btype="low", analog=False)
	return filtfilt(b, a, signal)


def remove_bias(rate_signal, stationary_sample_count):
	bias = np.mean(rate_signal[:stationary_sample_count])
	return rate_signal - bias, bias


def trapezoidal_integrate(rate_signal, sample_rate_hz, initial_angle=0.0):
	dt = 1.0 / sample_rate_hz
	angle = np.empty_like(rate_signal, dtype=float)
	angle[0] = initial_angle
	for index in range(1, len(rate_signal)):
		angle[index] = angle[index - 1] + 0.5 * (rate_signal[index] + rate_signal[index - 1]) * dt
	return angle


sample_rate_hz = 250.0
cutoff_hz = 10.0
stationary_sample_count = 250

# Example pitch-rate data in deg/s.
gyro_pitch_rate_deg_s = np.asarray([0.15, 0.12, 0.11, -1.5, -4.0, -8.5, -12.0, -14.0, -13.0])

bias_corrected_rate_deg_s, estimated_bias_deg_s = remove_bias(
	gyro_pitch_rate_deg_s,
	stationary_sample_count=min(stationary_sample_count, len(gyro_pitch_rate_deg_s)),
)

filtered_rate_deg_s = butter_lowpass_filter(
	bias_corrected_rate_deg_s,
	sample_rate_hz=sample_rate_hz,
	cutoff_hz=cutoff_hz,
	order=2,
)

pitch_angle_deg = trapezoidal_integrate(
	filtered_rate_deg_s,
	sample_rate_hz=sample_rate_hz,
	initial_angle=0.0,
)
```

If a long recording is being processed and drift remains significant after zero-rate correction, the gyroscope-only estimate should be stabilized with an accelerometer reference or a sensor-fusion method rather than relying on pure integration alone.