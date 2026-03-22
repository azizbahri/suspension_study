# Required DAQ Hardware for Suspension Analysis: Measurement Architecture, Sensor Reasoning, and Formula Inputs

## Abstract

This report expands Section 1 of [overview.md](overview.md) by explaining what the required DAQ hardware means in practical engineering terms. The objective is to clarify why each sensor is needed, what physical quantity it measures, how its range and resolution affect the later calculations, and which minimum set of measurements is required to construct the plots and formulas used throughout the suspension-analysis framework. Rather than treating Section 1 as only a hardware list, this report treats it as the measurement architecture that makes the rest of the document possible.

---

## 1. Introduction

Section 1 of the overview defines the data-acquisition stack required to turn suspension tuning into a quantitative measurement problem. That hardware list is not arbitrary. Each device exists because a later equation, derivative, histogram, or telemetry trace depends on a specific measured signal.

At a high level, the DAQ system must provide four things:

1. suspension displacement,
2. angular-rate data for pitch estimation,
3. acceleration data for impact and braking context,
4. a time base with enough sampling rate to resolve high-speed suspension events.

The measurement chain can be summarized as

$$
\text{Sensors} \rightarrow \text{DAQ channels} \rightarrow \text{calibrated physical variables} \rightarrow \text{plots and tuning decisions}
$$

Everything in the later sections depends on the quality of this chain.

---

## 2. What Section 1 Means

Section 1 is specifying the minimum hardware required to measure the state variables needed later in the framework. Those later variables include:

- front wheel travel,
- rear wheel travel,
- suspension velocity,
- chassis pitch angle,
- longitudinal acceleration,
- ride-time distributions in travel and velocity space.

In other words, the hardware section is really defining the observability of the system. If a required signal is not measured with adequate range, adequate resolution, or adequate sample rate, then the later mathematical framework becomes unreliable.

The hardware therefore has to be chosen by working backward from the later equations.

---

## 3. Minimum Measurements Needed to Complete the Framework

To compute the formulas and plots used later in the overview, the following measured channels are required.

### 3.1 Front Displacement Channel

Needed for:

- front wheel travel,
- front travel histogram,
- front velocity estimation,
- front compression and rebound interpretation.

This channel is used in the front travel model

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

This channel is used in the rear travel model

$$
s_{rear,n} = (V_{rear,n} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear,n} = a s_{rear,n}^2 + b s_{rear,n} + c
$$

### 3.3 Gyroscope Pitch-Rate Channel

Needed for:

- pitch-angle estimation,
- brake-dive interpretation,
- chassis load-transfer analysis.

This channel is used in

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2} \Delta t
$$

### 3.4 Accelerometer Channel

Needed for:

- harshness or impact confirmation,
- braking and acceleration context,
- overlay in the pitch telemetry graph.

This is used in

$$
A_{x,n}^{(g)} = \frac{a_{x,n}}{g}
$$

### 3.5 Time Base and Sample Index

Needed for all derivatives, all integrations, and all time-domain plots.

With sampling rate $f_s$,

$$
\Delta t = \frac{1}{f_s}
$$

and time samples are

$$
t_n = n\Delta t
$$

Without this time base, neither the velocity calculation nor the pitch-angle integration can be performed.

---

## 4. Linear Potentiometers: Why They Are Required

The overview specifies front and rear linear potentiometers because suspension analysis begins with displacement measurement.

### 4.1 What They Measure

A linear potentiometer converts mechanical stroke into voltage. If the potentiometer output range is 0 to 5 V, then the measured voltage is mapped to stroke through calibration. In general form,

$$
s = (V_{raw} - V_0) \cdot C_{cal}
$$

where:

- $s$ is stroke in mm,
- $V_0$ is the zero offset,
- $C_{cal}$ is the calibration constant in mm/V.

### 4.2 Why a Front Sensor Is Required

The front potentiometer is required because the fork position is the basis for:

- front travel percentage,
- front velocity histogram,
- brake-dive interpretation when combined with pitch data.

If the front channel is missing, then the framework cannot quantify fork support, dive, or compression and rebound behavior at the front end.

### 4.3 Why a Rear Sensor Is Required

The rear potentiometer is required because the rear shock or linkage motion is the basis for:

- rear travel percentage,
- rear velocity histogram,
- packing and kickback interpretation,
- rear balance relative to the front.

Because the rear linkage is non-linear, the rear sensor is especially important. Rear behavior cannot be inferred reliably from front measurements alone.

### 4.4 Why the Stated Stroke Lengths Make Sense

The overview specifies:

- 250 mm stroke for the front,
- 75 mm to 100 mm stroke for the rear shock.

This is a geometric requirement. The sensor must span the full expected motion of the component it is attached to without saturating. If the sensor bottoms internally before the suspension bottoms mechanically, the measurement becomes useless near the most important part of the stroke.

Thus the sensor stroke length must satisfy

$$
s_{sensor,max} > s_{mechanism,max}
$$

with additional margin for mounting tolerances and dynamic overtravel.

---

## 5. ADC Resolution: Why 12-Bit or 16-Bit Matters

The overview specifies an analog voltage output converted through a 12-bit or 16-bit ADC. This requirement exists because displacement resolution depends directly on voltage resolution.

### 5.1 Voltage Resolution

If the ADC full-scale range is $V_{ref}$ and the converter has $N$ bits, then the voltage resolution is approximately

$$
\Delta V = \frac{V_{ref}}{2^N - 1}
$$

For a 0 to 5 V system:

$$
\Delta V_{12} = \frac{5}{4095} \approx 1.22 \text{ mV}
$$

$$
\Delta V_{16} = \frac{5}{65535} \approx 0.076 \text{ mV}
$$

### 5.2 Displacement Resolution

If the sensor calibration constant is $C_{cal}$ in mm/V, then the theoretical displacement resolution is

$$
\Delta s = C_{cal} \Delta V
$$

As an illustrative example, if a 250 mm front sensor spans 0 to 5 V, then

$$
C_{front} = \frac{250}{5} = 50 \text{ mm/V}
$$

so the 12-bit displacement resolution is approximately

$$
\Delta s_{12} = 50 \cdot 0.00122 \approx 0.061 \text{ mm}
$$

and the 16-bit resolution is approximately

$$
\Delta s_{16} = 50 \cdot 0.000076 \approx 0.0038 \text{ mm}
$$

These are ideal quantization values, but they show why higher ADC resolution improves the fidelity of the later derivative calculation.

### 5.3 Why Resolution Matters for Velocity

Velocity is a derivative, so quantization noise in displacement is amplified when divided by $\Delta t$:

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

If the displacement channel is too coarse, the velocity histogram becomes noisy and unreliable. That is the real reason ADC resolution matters in this application.

---

## 6. IMU: Why a 6-Axis Unit Is Required

The overview specifies a 6-axis IMU because the framework needs both acceleration and angular-rate information.

### 6.1 Why an Accelerometer Is Needed

The accelerometer provides the inertial context for the suspension events. It answers questions such as:

- was a spike due to a harsh impact,
- was the bike under braking,
- how severe was the load transfer or chassis input.

This is essential for interpreting Graph 2 and Graph 3 correctly. A fast compression event is not enough information by itself. The accelerometer helps determine whether the event corresponds to braking, acceleration, or terrain impact.

### 6.2 Why a Gyroscope Is Needed

The gyroscope is required because pitch angle is not directly measured by the potentiometers. It is estimated by integrating the pitch-rate channel:

$$
\phi(t) = \phi(0) + \int_0^t \omega_{y,f}(\tau) \, d\tau
$$

Without the gyroscope, the framework loses its direct measure of chassis rotation and therefore loses one of its strongest indicators of brake dive and load transfer.

### 6.3 Why the IMU Should Be Near the Center of Gravity

Mounting the IMU near the center of gravity reduces the contamination of the accelerometer signals by rotational leverage and structural vibration. The closer the sensor is to the chassis' representative rigid-body motion, the easier it is to interpret acceleration and pitch-rate data as actual vehicle-state information rather than local frame motion.

---

## 7. Why the Accelerometer Range Must Be at Least $\pm 16g$

The overview specifies a minimum accelerometer range of $\pm 16g$ to capture harsh bottom-out impacts. This is a dynamic-range requirement.

If the maximum real acceleration exceeds the accelerometer range, the sensor saturates:

$$
\lvert a_{meas} \rvert > a_{range,max} \Rightarrow \text{clipping}
$$

Once clipping occurs, the recorded impact amplitude is no longer trustworthy. Since harshness diagnosis in Section 4.2 explicitly relies on IMU spike magnitude, saturation would undermine that interpretation.

Thus the accelerometer range must be large enough to preserve the peaks associated with off-road impacts and bottoming events.

---

## 8. Why the Gyroscope Range Must Be at Least $\pm 500^\circ/s$

The overview specifies a minimum gyroscope range of $\pm 500^\circ/s$ to capture pitch and roll rates. This is also a dynamic-range requirement.

If the chassis rotates faster than the gyroscope can represent, then the pitch-rate measurement clips:

$$
\lvert \omega_{meas} \rvert > \omega_{range,max} \Rightarrow \text{clipping}
$$

Since pitch angle is obtained by integrating pitch rate, clipped rate data causes immediate corruption of the angle estimate. For braking events, jumps, and abrupt attitude changes, adequate rate range is essential.

---

## 9. Why the Logger Must Sample at 250 Hz

The overview specifies a minimum sample rate of 250 Hz, corresponding to a sample interval of

$$
\Delta t = \frac{1}{250} = 0.004 \text{ s}
$$

### 9.1 Why Time Resolution Matters

Suspension events can evolve very quickly, especially sharp impacts. If the sample interval is too large, then fast events are under-sampled and the resulting displacement, velocity, and IMU traces are distorted.

### 9.2 Nyquist Reasoning

To avoid aliasing, the sample rate must exceed twice the highest frequency of interest:

$$
f_s > 2 f_{max}
$$

This is the Nyquist criterion. The overview's 250 Hz requirement is a practical engineering choice intended to capture high-speed damping events while preserving acceptable time resolution for filtering and differentiation.

### 9.3 Why Sample Rate Matters for Velocity

Velocity estimation depends on finite differences over the sample interval:

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

If $\Delta t$ is too large, then:

- peak velocities are blurred,
- narrow impact events are missed,
- histogram distributions are smeared,
- derivative error increases.

Thus the sample rate is not just a logging convenience. It directly affects the quality of the damping analysis.

---

## 10. What Measurements Are Needed for Each Plot

Section 3 of the overview defines three primary graphs. Each one depends on a specific measurement set.

### 10.1 Graph 1: Position or Travel Histogram

Required measurements:

- front or rear displacement sensor voltage,
- calibration constants and offsets,
- total available wheel travel.

Derived variable:

$$
P_n = 100 \cdot \frac{W_n}{W_{max}}
$$

This graph cannot be built without calibrated displacement.

### 10.2 Graph 2: Velocity Histogram

Required measurements:

- displacement channel,
- sampling interval,
- filtered displacement signal,
- optionally IMU acceleration for event interpretation.

Derived variable:

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

This graph cannot be built without both displacement and an adequate time base.

### 10.3 Graph 3: Pitch Angle Versus Time

Required measurements:

- gyroscope pitch-rate channel,
- accelerometer longitudinal channel,
- sampling interval,
- bias estimate and filtering parameters.

Derived variables:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2} \Delta t
$$

$$
A_{x,n}^{(g)} = \frac{a_{x,n}}{g}
$$

This graph cannot be built reliably without both the gyroscope and accelerometer.

---

## 11. What Measurements Are Needed for Each Main Formula

The core mathematical framework can be mapped directly to hardware measurements.

### 11.1 Front Travel Formula

$$
W_{front} = (V_{raw} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

Required inputs:

- front potentiometer voltage,
- front zero offset,
- front calibration constant,
- fork angle.

### 11.2 Rear Travel Formula

$$
s_{rear} = (V_{raw,rear} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear}(s_{rear}) = a s_{rear}^2 + b s_{rear} + c
$$

Required inputs:

- rear potentiometer voltage,
- rear zero offset,
- rear calibration constant,
- bike-specific linkage constants.

### 11.3 Velocity Formula

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

Required inputs:

- filtered displacement,
- sample rate or sample interval.

### 11.4 Pitch Formula

$$
\phi(t) = \phi(0) + \int_0^t \omega_{y,f}(\tau) \, d\tau
$$

Required inputs:

- gyroscope pitch-rate channel,
- bias correction,
- filtering,
- time base.

---

## 12. Practical Interpretation of the Hardware Stack

If the hardware stack is incomplete, the later framework becomes incomplete in specific ways:

- no displacement sensor means no travel or velocity histogram,
- no gyroscope means no pitch-angle trace,
- no accelerometer means poor impact and braking context,
- no adequate sample rate means unreliable derivatives and aliasing,
- no adequate ADC resolution means noisy displacement and therefore noisy velocity.

This is why Section 1 must be understood as a technical requirement definition rather than a generic parts list.

---

## 13. Sensor-Channel Summary Table

The following table condenses the minimum measurement set into a GitHub-friendly reference format.

| Channel | Measured Quantity | Typical Unit | Primary Formula Dependencies | Primary Plot Dependencies |
| --- | --- | --- | --- | --- |
| Front potentiometer | Front fork displacement voltage | V | $W_{front} = (V_{front} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)$ | Graph 1 front travel histogram, Graph 2 front velocity histogram |
| Rear potentiometer | Rear shock displacement voltage | V | $s_{rear} = (V_{rear} - V_{0,rear}) \cdot C_{rear}$ and $W_{rear} = a s_{rear}^2 + b s_{rear} + c$ | Graph 1 rear travel histogram, Graph 2 rear velocity histogram |
| ADC sample from displacement channels | Quantized sensor voltage | counts or V | $\Delta V = \frac{V_{ref}}{2^N - 1}$ and $\Delta s = C_{cal}\Delta V$ | Affects fidelity of Graph 1 and Graph 2 via displacement and derivative quality |
| Gyroscope Y-axis | Pitch rate | deg/s or rad/s | $\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2}\Delta t$ | Graph 3 pitch-angle trace |
| Accelerometer longitudinal axis | Longitudinal acceleration | $\text{m/s}^2$ or g | $A_{x}^{(g)} = \frac{a_x}{g}$ | Graph 3 acceleration overlay, Graph 2 impact and braking interpretation |
| Logger time base | Sample timing | s | $\Delta t = \frac{1}{f_s}$, $t_n = n\Delta t$, $v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$ | Required for Graph 2 and Graph 3, and for histogram time-percentage calculations |

This table is the compact version of the hardware argument made throughout the report: each channel exists because a later physical variable, formula, or graph depends on it directly.

---

## 14. Conclusion

Section 1 of the overview defines the DAQ hardware needed to make the rest of the suspension-analysis framework mathematically and physically valid. The front and rear linear potentiometers provide the displacement channels required for wheel travel and velocity calculations. The IMU provides the angular-rate and acceleration channels required for pitch-angle estimation, braking interpretation, and harshness identification. The ADC resolution defines how finely the analog sensor voltages can be resolved, and the logger sample rate defines whether high-speed suspension events can be captured without aliasing.

The later plots and formulas are therefore direct consequences of the measurement hardware. The hardware is not auxiliary to the framework. It is the foundation that determines whether the framework can be executed with sufficient fidelity to support real tuning decisions.