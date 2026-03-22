# Required DAQ Hardware for Suspension Analysis: Measurement Architecture, Sensor Reasoning, and Formula Inputs

## Abstract

This report expands Section 1 of [overview.md](overview.md) by explaining what the required DAQ hardware means in practical engineering terms. The objective is to clarify why each sensor is needed, what physical quantity it measures, how its range and resolution affect the later calculations, and which minimum set of measurements is required to construct the plots and formulas used throughout the suspension-analysis framework. It also addresses practical implementation considerations, such as supply-referenced measurement stability and long-horizon IMU drift mitigation, that become important when transitioning from theoretical physics to a functional measurement system.

---

## 1. Introduction

Section 1 of the overview defines the data-acquisition stack required to turn suspension tuning into a quantitative measurement problem. That hardware list is not arbitrary. Each device exists because a later equation, derivative, histogram, or telemetry trace depends on a specific measured signal.

At a high level, the DAQ system must provide four things:

1. suspension displacement,
2. angular-rate data for pitch estimation, with accelerometer data available for drift correction and dynamic context,
3. acceleration data for impact and braking context,
4. a time base with enough sampling rate to resolve high-speed suspension events.

The measurement chain can be summarized as

$$
	ext{Sensors} \rightarrow \text{DAQ channels} \rightarrow \text{Signal Conditioning and Optional Fusion} \rightarrow \text{calibrated physical variables} \rightarrow \text{plots and tuning decisions}
$$

Everything in the later sections depends on the quality, stability, and calibration of this chain.

---

## 2. What Section 1 Means

Section 1 is specifying the minimum hardware required to measure the state variables needed later in the framework. Those later variables include:

- front wheel travel,
- rear wheel travel,
- suspension velocity,
- chassis pitch angle,
- longitudinal acceleration,
- ride-time distributions in travel and velocity space.

If a required signal is not measured with adequate range, adequate resolution, adequate stability, or adequate sample rate, then the later mathematical framework becomes unreliable.

The hardware therefore still has to be chosen by working backward from the later equations and plots.

---

## 3. Minimum Measurements Needed to Complete the Framework

To compute the formulas and plots used later in the overview, the following measured channels are required.

### 3.1 Front Displacement Channel

Needed for:

- front wheel travel,
- front travel histogram,
- front velocity estimation,
- front compression and rebound interpretation.

This channel is used in the front travel model:

$$
W_{front,n} = (V_{front,n} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

### 3.2 Rear Displacement Channel

Needed for:

- rear shock stroke,
- rear wheel travel,
- rear travel histogram,
- rear velocity estimation,
- rear packing and rebound analysis.

This channel is used in the rear travel model:

$$
s_{rear,n} = (V_{rear,n} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear,n} = a s_{rear,n}^2 + b s_{rear,n} + c
$$

### 3.3 Gyroscope Pitch-Rate Channel, with Optional Accelerometer Correction

Needed for:

- pitch-angle estimation,
- brake-dive interpretation,
- chassis load-transfer analysis.

The mathematical framework in the overview uses the gyroscope pitch-rate channel directly:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2} \Delta t
$$

In practical systems, long-horizon pitch stability may be improved by combining gyroscope integration with an accelerometer-derived attitude estimate. One common low-cost implementation is a complementary filter:

$$
\phi_n = \alpha \cdot (\phi_{n-1} + \omega_{y,n} \cdot \Delta t) + (1 - \alpha) \cdot \phi_{acc,n}
$$

### 3.4 Accelerometer Channel

Needed for:

- harshness or impact confirmation,
- braking and acceleration context,
- overlay in the pitch telemetry graph,
- optional gravity-reference input for attitude stabilization.

This is used in:

$$
A_{x,n}^{(g)} = \frac{a_{x,n}}{g}
$$

### 3.5 Time Base and Sample Index

Needed for all derivatives, all integrations, and all time-domain plots.

With sampling rate $f_s$:

$$
\Delta t = \frac{1}{f_s}
$$

and time samples are:

$$
t_n = n\Delta t
$$

---

## 4. Linear Potentiometers: Why They Are Required

The overview specifies front and rear linear potentiometers because suspension analysis begins with displacement measurement.

### 4.1 What They Measure

A linear potentiometer acts as a voltage divider, converting mechanical stroke into an electrical signal. In an ideal general form:

$$
s = (V_{raw} - V_0) \cdot C_{cal}
$$

where:

- $s$ is stroke in mm,
- $V_0$ is the zero offset,
- $C_{cal}$ is the calibration constant in mm/V.

*Note: In practice, the measurement architecture should minimize supply-reference error and electrical noise so the derivative calculations remain reliable (see Section 5.4).*

### 4.2 Why a Front Sensor Is Required

The front potentiometer is required because the fork position is the basis for front travel percentage, front velocity histograms, and brake-dive interpretation.

### 4.3 Why a Rear Sensor Is Required

The rear potentiometer is required because the rear shock or linkage motion is the basis for rear travel percentage, velocity histograms, and packing analysis. Because the rear linkage is non-linear, the rear sensor is especially important.

---

## 5. ADC Resolution and Electrical Architecture

The overview specifies an analog voltage output converted through a 12-bit or 16-bit ADC. This requirement exists because displacement resolution depends directly on voltage resolution.

### 5.1 Ideal Voltage Resolution

If the ADC full-scale range is $V_{ref}$ and the converter has $N$ bits, then the voltage resolution is approximately:

$$
\Delta V = \frac{V_{ref}}{2^N - 1}
$$

For a 0 to 5 V system, $\Delta V_{12} \approx 1.22 \text{ mV}$ and $\Delta V_{16} \approx 0.076 \text{ mV}$.

### 5.2 Displacement Resolution

If the sensor calibration constant is $C_{cal}$ in mm/V, then the theoretical displacement resolution is $\Delta s = C_{cal} \Delta V$. Higher ADC resolution fundamentally improves the fidelity of the displacement signal.

### 5.3 Why Resolution Matters for Velocity

Velocity is a derivative, so quantization noise in displacement is amplified when divided by $\Delta t$:

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

If the displacement channel is too coarse, the velocity histogram becomes noisy and unusable. 

### 5.4 Practical Benefit of Ratiometric Measurement

Motorcycle electrical systems are incredibly noisy. If the 5V supply to the linear potentiometer drops by just 50mV due to the radiator fan turning on, an absolute ADC measurement will register a sudden drop in $V_{raw}$. The mathematical framework will interpret this voltage drop as a massive suspension movement, resulting in a severe, artificial velocity spike ($v > 500 \text{ mm/s}$) that ruins the data.

For potentiometric sensors, a ratiometric measurement architecture is therefore highly desirable. If the ADC reference voltage ($V_{ref}$) and the potentiometer supply voltage track the same source, much of the supply variation cancels in the digital measurement. This does not remove the need for calibration, but it greatly reduces one important source of artificial displacement noise.

In practice, the same calibration can be written in count space rather than voltage space:

$$
s_n = (\text{ADC}_{raw,n} - \text{ADC}_0) \cdot C_{count}
$$

where $\text{ADC}_0$ is the count-domain zero offset and $C_{count}$ is the calibration constant in mm/count. This is mathematically equivalent to voltage-domain calibration when the measurement chain is characterized correctly.

---

## 6. IMU: Why a 6-Axis Unit Is Required, and Why Drift Mitigation Matters

The overview specifies a 6-axis IMU because the framework needs both acceleration and angular-rate information to establish chassis attitude.

### 6.1 Why an Accelerometer Is Needed

The accelerometer provides the inertial context for the suspension events (e.g., was a suspension spike due to a rock, or from hard braking?). It answers how severe the load transfer or chassis input was.

### 6.2 Limitation of Pure Gyroscope Integration

A naive approach to calculating chassis pitch ($\phi$) simply integrates the Y-axis gyroscope data over time:

$$
\phi_{drift}(t) = \int_{0}^{t} (\omega_y(\tau) + \text{bias}) \, d\tau
$$

**The practical issue:** Due to thermal drift, sensor bias, and integration error, pure gyroscope integration accumulates error over time. For short transient events, this may be acceptable. For longer recordings or for stable absolute attitude estimation, some form of drift mitigation is usually required.

### 6.3 One Practical Drift-Mitigation Method: Complementary Filtering

For robust long-horizon pitch estimation, many systems combine the integrated gyroscope signal with an accelerometer-derived gravity reference. A complementary filter is one common low-cost approach. It acts as a high-pass path on the integrated gyroscope and a low-pass path on the accelerometer attitude estimate.

First, calculate the absolute pitch from the accelerometer's gravity vector:
$$
\phi_{acc} = \text{atan2}(-a_x, \sqrt{a_y^2 + a_z^2})
$$

Next, fuse this with the gyroscope using a tuning parameter $\alpha$ (typically 0.95 to 0.99):
$$
\phi_n = \alpha \cdot (\phi_{n-1} + \omega_{y,n} \cdot \Delta t) + (1 - \alpha) \cdot \phi_{acc,n}
$$

During hard longitudinal acceleration or braking, accelerometer-derived pitch becomes less trustworthy because the accelerometer is measuring both gravity and linear acceleration. In those conditions, practical implementations often increase the gyroscope weighting, but the exact adaptation logic is firmware-specific and should be treated as a design choice rather than a universal requirement.

---

## 7. Why the Accelerometer Range Must Be at Least $\pm 16g$

A minimum accelerometer range of $\pm 16g$ is required to capture harsh bottom-out impacts. If the maximum real acceleration exceeds the accelerometer range, the sensor saturates (clips). Once clipping occurs, harshness diagnosis becomes impossible. 

---

## 8. Why the Gyroscope Range Must Be at Least $\pm 500^\circ/s$

A minimum gyroscope range of $\pm 500^\circ/s$ is required. If the chassis rotates faster than the gyroscope can represent during a jump or crash, the measurement clips. Because pitch angle relies on gyroscope data in the short term, clipped rate data causes immediate corruption of the angle estimate.

---

## 9. Why the Logger Must Sample at 250 Hz (Minimum)

The overview specifies a minimum sample rate of 250 Hz ($\Delta t = 0.004 \text{ s}$).

### 9.1 Why Time Resolution Matters

Fast suspension events can have characteristic durations on the order of only a few milliseconds. At 250 Hz, the sample interval is 4 ms, which gives only a limited number of samples across a sharp impact. Slower sampling rates reduce the fidelity of the reconstructed displacement and velocity traces even further. For higher-end diagnostic products, 500 Hz to 1000 Hz may therefore be preferable when the logger, storage, and noise floor permit it.

### 9.2 Post-Processing Alignment Consideration

Because velocity is calculated via a finite difference ($v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$), high-frequency noise is severely amplified. A standard low-pass Butterworth filter reduces that noise but may introduce phase delay. For offline post-processing, zero-phase forward-backward filtering is often useful when precise alignment between velocity peaks and IMU spikes is important. For real-time systems, however, causal filtering must be used instead.

---

## 10. What Measurements Are Needed for Each Plot

### 10.1 Graph 1: Position or Travel Histogram
* **Required:** Calibrated displacement channel, calibration constants and offsets, total available wheel travel.
* **Derived:** $P_n = 100 \cdot \frac{W_n}{W_{max}}$

### 10.2 Graph 2: Velocity Histogram
* **Required:** Filtered displacement channel, accurate $\Delta t$.
* **Derived:** $v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$

### 10.3 Graph 3: Pitch Angle Versus Time
* **Required:** Gyroscope Y-axis, longitudinal accelerometer channel, sample interval, bias estimate, and optionally full IMU acceleration if attitude stabilization is used.
* **Derived:** Baseline framework: $\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2} \Delta t$. One practical stabilized alternative is a complementary filter using $\phi_{acc}$.

---

## 11. Sensor-Channel Summary Table

| Channel | Measured Quantity | Typical Unit | Primary Formula Dependencies | Primary Plot Dependencies |
| --- | --- | --- | --- | --- |
| Front potentiometer | Front displacement signal, preferably measured with a supply-stable or ratiometric architecture | counts or V | $W_{front} = (V_{front} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)$ or count-domain equivalent | Graph 1 & 2 front histograms |
| Rear potentiometer | Rear displacement signal, preferably measured with a supply-stable or ratiometric architecture | counts or V | $s_{rear} = (V_{rear} - V_{0,rear}) \cdot C_{rear}$ and $W_{rear} = a s_{rear}^2 + b s_{rear} + c$ | Graph 1 & 2 rear histograms |
| Gyroscope Y-axis | Pitch rate $\omega_y$ | deg/s or rad/s | $\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2}\Delta t$ | Graph 3 pitch-angle trace |
| Accelerometer longitudinal axis | Longitudinal acceleration | $\text{m/s}^2$ or g | $A_x^{(g)} = \frac{a_x}{g}$ | Graph 3 acceleration overlay and Graph 2 event context |
| Accelerometer 3-axis vector | Gravity-reference and inertial acceleration vector | $\text{m/s}^2$ | Optional stabilized estimate: $\phi_{acc} = \text{atan2}(-a_x, \sqrt{a_y^2 + a_z^2})$ | Optional Graph 3 pitch stabilization |
| Logger time base | Sample timing | s | $\Delta t = \frac{1}{f_s}$ and $v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$ | Required for all histograms and rates |

---

## 12. Conclusion

Section 1 of the overview defines the DAQ hardware needed to make the rest of the suspension-analysis framework mathematically and physically valid. The transition from theory to a robust measurement tool requires not only sufficient sensor range and resolution, but also practical attention to measurement stability, calibration fidelity, and IMU drift over time. Approaches such as supply-stable or ratiometric acquisition and optional IMU fusion can improve robustness, but they complement rather than replace the core calibration and time-base requirements of the framework.