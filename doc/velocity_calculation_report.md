# Velocity Calculation for Suspension DAQ: Derivation, Discrete Estimation, and Signal-Processing Considerations

## Abstract

This report expands Section 2.2 of [overview.md](overview.md) by formalizing the velocity-calculation step used in suspension data acquisition. The purpose is to explain what the velocity term represents physically, why the derivative of displacement appears in the governing equation, and how that quantity is obtained from sampled DAQ data in practice. The report also distinguishes between wheel velocity and true damper-shaft velocity, because those quantities are equal only in direct-acting systems or under simplifying assumptions.

---

## 1. Introduction

Suspension damping force is governed primarily by the speed at which the damper is being compressed or extended. For that reason, displacement data alone are not sufficient for damping analysis. The displacement signal must be converted into velocity.

In the overview, this is written as

$$
v(t) = \frac{d}{dt}W(t) = \frac{W_n - W_{n-1}}{\Delta t}
$$

where $W(t)$ is displacement and $\Delta t$ is the sample interval.

This expression has two layers:

- a continuous-time physical definition, and
- a discrete-time numerical approximation suitable for DAQ data.

Understanding both is essential if the resulting velocity histogram is to be used for tuning decisions.

---

## 2. Physical Meaning of Velocity in Suspension Analysis

Velocity is the time rate of change of displacement. If wheel travel or damper stroke changes rapidly, then the suspension is moving quickly. If it changes slowly, then the suspension is moving slowly.

In continuous form,

$$
v(t) = \frac{dW}{dt}
$$

This means that velocity is the slope of the displacement-time trace. A steep slope corresponds to high suspension speed, while a shallow slope corresponds to low suspension speed.

In practical tuning terms:

- low velocity is associated with brake dive, chassis pitch, throttle squat, and gradual load transfer,
- high velocity is associated with sharp bumps, rocks, roots, square edges, and harsh impact events.

Because damper circuits are velocity-sensitive, the velocity signal is more diagnostic for damping behavior than displacement alone.

---

## 3. Why the Derivative Appears in the Formula

The overview states that damping forces depend on the velocity of the damper shaft. This follows directly from the physical behavior of hydraulic dampers.

When the suspension moves, the damper piston forces fluid through bleed ports, shims, or valving restrictions. The faster the piston moves, the higher the fluid flow rate and the larger the pressure differential across the damping elements. In simplified form, damping force is often modeled as a function of shaft velocity:

$$
F_d = f(v_{shaft})
$$

For idealized linear viscous damping, this reduces to

$$
F_d = c v_{shaft}
$$

where $c$ is a damping coefficient. Real motorcycle dampers are not perfectly linear, but the governing independent variable is still shaft velocity. That is why the derivative of displacement with respect to time is the quantity of interest.

If displacement is known as a function of time, then its derivative produces the speed of the moving suspension component:

$$
v(t) = \frac{d}{dt}W(t)
$$

Thus, the velocity formula is not just a mathematical convenience. It is the kinematic quantity that connects the measured motion to the hydraulic behavior of the damper.

---

## 4. From Continuous-Time Physics to Discrete DAQ Data

In theory, the derivative is defined continuously. In practice, a DAQ logger produces samples at discrete times:

$$
t_n = n\Delta t
$$

with corresponding displacement samples:

$$
W_n = W(t_n)
$$

Because the data exist only at isolated sampling instants, the derivative must be approximated numerically.

### 4.1 Backward-Difference Form Used in the Overview

The overview uses the first-order backward difference:

$$
v_n \approx \frac{W_n - W_{n-1}}{\Delta t}
$$

This estimate is obtained by taking the slope between two consecutive samples. Its advantages are:

- it is simple,
- it is causal, which makes it suitable for real-time implementation,
- it requires only the current and previous sample.

If the logger samples at 250 Hz, then

$$
\Delta t = \frac{1}{250} = 0.004 \text{ s}
$$

and the discrete estimate becomes

$$
v_n \approx \frac{W_n - W_{n-1}}{0.004}
$$

with units of mm/s if $W$ is measured in mm.

### 4.2 Alternative Numerical Derivatives

A more accurate offline estimate is the central difference:

$$
v_n \approx \frac{W_{n+1} - W_{n-1}}{2\Delta t}
$$

This has lower truncation error than the backward difference, but it is non-causal because it requires a future sample. For post-processing, it may be preferable. For real-time DAQ channels, the backward difference is operationally simpler.

---

## 5. How Velocity Is Attained from DAQ Data

The DAQ system does not output velocity directly. Velocity is computed from the sampled sensor signal through a sequence of transformations.

### 5.1 Acquisition Pipeline

The practical signal chain is

$$
\text{ADC counts} \rightarrow V_{raw} \rightarrow W(t) \rightarrow W_f(t) \rightarrow v(t)
$$

where:

- ADC counts are the raw digital values recorded by the logger,
- $V_{raw}$ is the corresponding sensor voltage,
- $W(t)$ is the converted displacement signal,
- $W_f(t)$ is the filtered displacement signal,
- $v(t)$ is the final estimated velocity.

### 5.2 Step 1: Convert Raw ADC Data to Voltage

If the DAQ reads an $N$-bit analog-to-digital converter over a voltage range $V_{ref}$, a raw count value $x_n$ can be converted to voltage as

$$
V_{raw,n} = \frac{x_n}{2^N - 1}V_{ref}
$$

For a 12-bit, 0 to 5 V system,

$$
V_{raw,n} = \frac{x_n}{4095} \cdot 5
$$

### 5.3 Step 2: Convert Voltage to Displacement

The voltage signal is translated to displacement using the calibrated models from Section 2.1 of the overview.

For the front:

$$
W_{front,n} = (V_{front,n} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

For the rear, if wheel travel is required:

$$
s_{rear,n} = (V_{rear,n} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear,n} = a s_{rear,n}^2 + b s_{rear,n} + c
$$

At this stage, the DAQ has a displacement time series sampled at uniform intervals.

### 5.4 Step 3: Filter the Displacement Signal

The overview correctly notes that the displacement should be filtered before differentiation. Let the filtered displacement be denoted by $W_{f,n}$. Then the velocity estimate should be formed as

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

instead of differentiating the unfiltered displacement directly.

### 5.5 Step 4: Differentiate the Filtered Signal

Once filtering is complete, the numerical derivative produces the velocity time series. This time series can then be used to build histograms, detect peak compression and rebound events, and compare low-speed and high-speed damping behavior.

---

## 6. Why Filtering Is Required Before Differentiation

Differentiation amplifies high-frequency noise. This is a fundamental property of the derivative operator.

Suppose the measured displacement is the sum of true motion and measurement noise:

$$
W_{meas}(t) = W_{true}(t) + n(t)
$$

Then the derivative becomes

$$
\frac{dW_{meas}}{dt} = \frac{dW_{true}}{dt} + \frac{dn}{dt}
$$

Even if the noise amplitude $n(t)$ is small, its derivative can be large because noise often varies rapidly from sample to sample. This makes raw differentiated signals appear jagged and physically implausible.

For that reason, a low-pass filter is applied to displacement first. The overview suggests a second-order Butterworth filter with a 20 Hz cutoff:

$$
W_f(t) = \operatorname{LPF}\{W(t)\}
$$

followed by

$$
v(t) = \frac{d}{dt}W_f(t)
$$

The Butterworth family is commonly chosen because it has a maximally flat magnitude response in the passband, which preserves the main shape of suspension motion without introducing excessive passband ripple.

---

## 7. Wheel Velocity Versus Damper-Shaft Velocity

This distinction is critical.

The overview writes velocity as

$$
v(t) = \frac{d}{dt}W(t)
$$

If $W(t)$ represents wheel travel, then this equation produces wheel vertical velocity, not damper-shaft velocity. Those are not always the same quantity.

### 7.1 Front Suspension

For a direct-acting front fork, the distinction is often small enough that wheel-travel velocity and damper-axis velocity can be treated as nearly proportional. If the front model is

$$
W_{front} = s_f \cos(\theta)
$$

then differentiation gives

$$
\frac{dW_{front}}{dt} = \cos(\theta) \frac{ds_f}{dt}
$$

so that

$$
v_{shaft,front} = \frac{1}{\cos(\theta)} \frac{dW_{front}}{dt}
$$

If $\theta$ is modest and constant, the two differ only by a constant scaling factor.

### 7.2 Rear Suspension

For the rear suspension, the distinction is more important because the linkage ratio changes with position. If

$$
W_{rear}(s) = a s^2 + b s + c
$$

then by the chain rule,

$$
\frac{dW_{rear}}{dt} = \frac{dW_{rear}}{ds}\frac{ds}{dt}
$$

Since

$$
\frac{dW_{rear}}{ds} = 2as + b
$$

the true rear damper-shaft velocity is

$$
v_{shaft,rear} = \frac{ds}{dt} = \frac{1}{2as + b} \frac{dW_{rear}}{dt}
$$

This means that differentiating wheel travel alone does not directly yield damper-shaft velocity unless the motion ratio is also accounted for.

### 7.3 Practical Interpretation

If the analysis goal is ride-motion characterization, wheel velocity is often acceptable. If the goal is true damping analysis, especially for the rear suspension, the more physically correct quantity is damper-shaft velocity.

The most rigorous processing chain is therefore:

$$
V_{rear} \rightarrow s_{rear}(t) \rightarrow v_{shaft,rear}(t) = \frac{ds_{rear}}{dt}
$$

and then, if needed,

$$
W_{rear}(t) = a s_{rear}(t)^2 + b s_{rear}(t) + c
$$

for wheel-travel plotting.

---

## 8. Sign Convention and Histogram Interpretation

Velocity histograms require a consistent sign convention. The overview uses:

- negative velocity for compression,
- positive velocity for rebound.

This is a valid convention, but it must be enforced consistently in the displacement definition. If displacement is defined as increasing with compression, then the derivative will naturally be positive in compression. In that case, the sign must be inverted before generating the histogram:

$$
v_{hist} = -\frac{dW}{dt}
$$

or alternatively the displacement coordinate itself must be defined oppositely. The convention matters less than consistency, because tuning conclusions depend on comparing the compression and rebound sides of the velocity distribution correctly.

---

## 9. Example Using a 250 Hz DAQ Sample Rate

Assume the displacement channel is sampled at 250 Hz, so that

$$
\Delta t = 0.004 \text{ s}
$$

If two consecutive filtered displacement samples are

$$
W_{f,n-1} = 118.4 \text{ mm}
$$

and

$$
W_{f,n} = 117.2 \text{ mm}
$$

then the discrete velocity estimate is

$$
v_n \approx \frac{117.2 - 118.4}{0.004} = -300 \text{ mm/s}
$$

Under the overview's convention, this would be a compression event because the velocity is negative.

---

## 10. Recommended Implementation Workflow

For suspension DAQ post-processing, the recommended sequence is:

1. Read the sampled ADC channel and timestamps.
2. Convert ADC counts to voltage.
3. Convert voltage to displacement using the calibrated front or rear model.
4. Apply a low-pass filter to the displacement channel.
5. Differentiate the filtered displacement numerically.
6. Apply the desired sign convention.
7. If damping analysis is the objective, convert from wheel velocity to shaft velocity where required by the suspension geometry.

In compact mathematical form,

$$
x_n \rightarrow V_n \rightarrow W_n \rightarrow W_{f,n} \rightarrow v_n
$$

with

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

or, for rear damper-shaft velocity,

$$
v_{shaft,rear,n} \approx \frac{s_{f,n} - s_{f,n-1}}{\Delta t}
$$

where the notation should be adapted to the specific sensor channel being processed.

---

## 11. Conclusion

The velocity equation in the overview is the discrete form of the basic kinematic identity that velocity is the time derivative of displacement. It appears because hydraulic damping forces are governed by the speed of suspension motion, not by position alone.

In a DAQ system, velocity is attained by converting sampled sensor data into displacement, filtering that displacement to suppress noise, and then computing a numerical derivative over the sample interval $\Delta t$. The backward-difference estimate shown in the overview is a practical real-time implementation of this idea.

For rigorous suspension analysis, the distinction between wheel velocity and damper-shaft velocity should be respected. This is especially important in linkage-driven rear suspensions, where the motion ratio varies with position and the chain rule must be applied if the true damper-shaft velocity is required.

---

## Appendix A. Example Python Implementation

The following example shows one practical way to filter a displacement signal and compute velocity in Python. It is intended as a reference implementation for offline DAQ post-processing.

```python
import numpy as np
from scipy.signal import butter, filtfilt


def butter_lowpass_filter(signal_mm, sample_rate_hz, cutoff_hz, order=2):
	nyquist_hz = 0.5 * sample_rate_hz
	normalized_cutoff = cutoff_hz / nyquist_hz
	b, a = butter(order, normalized_cutoff, btype="low", analog=False)
	return filtfilt(b, a, signal_mm)


def backward_difference(signal_mm, sample_rate_hz):
	dt = 1.0 / sample_rate_hz
	velocity_mm_s = np.empty_like(signal_mm, dtype=float)
	velocity_mm_s[0] = np.nan
	velocity_mm_s[1:] = np.diff(signal_mm) / dt
	return velocity_mm_s


def central_difference(signal_mm, sample_rate_hz):
	dt = 1.0 / sample_rate_hz
	velocity_mm_s = np.empty_like(signal_mm, dtype=float)
	velocity_mm_s[0] = np.nan
	velocity_mm_s[-1] = np.nan
	velocity_mm_s[1:-1] = (signal_mm[2:] - signal_mm[:-2]) / (2.0 * dt)
	return velocity_mm_s


sample_rate_hz = 250.0
cutoff_hz = 20.0

# Example displacement channel in mm.
wheel_travel_mm = np.asarray([0.0, 0.8, 2.1, 3.0, 2.6, 1.4, 0.2])

filtered_travel_mm = butter_lowpass_filter(
	wheel_travel_mm,
	sample_rate_hz=sample_rate_hz,
	cutoff_hz=cutoff_hz,
	order=2,
)

velocity_backward_mm_s = backward_difference(filtered_travel_mm, sample_rate_hz)
velocity_central_mm_s = central_difference(filtered_travel_mm, sample_rate_hz)
```

If the displacement channel is defined so that compression increases the numerical value of $W$, but the histogram convention requires negative values for compression, then the plotted velocity should be

$$
v_{hist} = -v
$$

For rear damper-shaft analysis, the preferred workflow is to apply the same filtering and differentiation operations to the calibrated shock-stroke signal $s(t)$ rather than to wheel travel.