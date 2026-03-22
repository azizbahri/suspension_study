# Required DAQ Hardware for Suspension Analysis: Measurement Architecture, Sensor Reasoning, and Formula Inputs

## Abstract

This report expands Section 1 of [overview.md](overview.md) by explaining what the required DAQ hardware means in practical engineering terms. The objective is to clarify why each sensor is needed, what physical quantity it measures, how its range and resolution affect the later calculations, and which minimum set of measurements is required to construct the plots and formulas used throughout the suspension-analysis framework. Crucially, it addresses the real-world signal processing requirements—such as ratiometric ADC measurement and sensor fusion—necessary to transition from theoretical physics to a functional, noise-resistant product architecture.

---

## 1. Introduction

Section 1 of the overview defines the data-acquisition stack required to turn suspension tuning into a quantitative measurement problem. That hardware list is not arbitrary. Each device exists because a later equation, derivative, histogram, or telemetry trace depends on a specific measured signal.

At a high level, the DAQ system must provide four things:

1. suspension displacement,
2. angular-rate and acceleration data for fused pitch estimation,
3. acceleration data for impact and braking context,
4. a time base with enough sampling rate to resolve high-speed suspension events.

The measurement chain can be summarized as

$$
\text{Sensors} \rightarrow \text{DAQ channels} \rightarrow \text{Signal Processing (Filtering/Fusion)} \rightarrow \text{calibrated physical variables} \rightarrow \text{plots and tuning decisions}
$$

Everything in the later sections depends on the quality and stability of this chain.

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

### 3.3 IMU Sensor Fusion Channels (Gyro & Accel for Pitch)

Needed for:

- stable pitch-angle estimation,
- brake-dive interpretation,
- chassis load-transfer analysis.

Unlike pure integration, a stable pitch channel requires fusing the gyroscope rate ($\omega_y$) with the accelerometer gravity vector ($\phi_{acc}$):

$$
\phi_n = \alpha \cdot (\phi_{n-1} + \omega_{y,n} \cdot \Delta t) + (1 - \alpha) \cdot \phi_{acc,n}
$$

### 3.4 Accelerometer Channel (Longitudinal & Vertical)

Needed for:

- harshness or impact confirmation,
- braking and acceleration context,
- overlay in the pitch telemetry graph.

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

*Note: In practice, converting this voltage requires specific electrical architectures to prevent noise from ruining the derivative calculations (see Section 5.4).*

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

### 5.4 The Ratiometric Measurement Mandate (Critical Fix)

Motorcycle electrical systems are incredibly noisy. If the 5V supply to the linear potentiometer drops by just 50mV due to the radiator fan turning on, an absolute ADC measurement will register a sudden drop in $V_{raw}$. The mathematical framework will interpret this voltage drop as a massive suspension movement, resulting in a severe, artificial velocity spike ($v > 500 \text{ mm/s}$) that ruins the data.

To prevent this, the DAQ must use **Ratiometric Measurement**. The ADC reference voltage ($V_{ref}$) and the potentiometer supply voltage must be the exact same electrical trace. Therefore, any fluctuation in the supply voltage causes an equal fluctuation in the ADC reference, cancelling out the error. 

Instead of measuring absolute voltage, the firmware maps raw ADC counts directly to stroke:

$$
s_{n} = \left( \frac{\text{ADC}_{raw,n}}{2^N - 1} \right) \cdot s_{max}
$$

---

## 6. IMU: Why a 6-Axis Unit and Sensor Fusion Are Required

The overview specifies a 6-axis IMU because the framework needs both acceleration and angular-rate information to establish chassis attitude.

### 6.1 Why an Accelerometer Is Needed

The accelerometer provides the inertial context for the suspension events (e.g., was a suspension spike due to a rock, or from hard braking?). It answers how severe the load transfer or chassis input was.

### 6.2 The Flaw of Pure Gyroscope Integration

A naive approach to calculating chassis pitch ($\phi$) simply integrates the Y-axis gyroscope data over time:

$$
\phi_{drift}(t) = \int_{0}^{t} (\omega_y(\tau) + \text{bias}) \, d\tau
$$

**The Reality:** Due to thermal noise and microscopic sensor bias, pure integration results in an *unbounded random walk*. Within 60 seconds of riding, the software will calculate that the motorcycle is doing a backflip, even if it is parked. Pure integration cannot be used in a real-world product.

### 6.3 Sensor Fusion: The Complementary Filter Architecture

To achieve stable, drift-free pitch estimation, the DAQ must employ **Sensor Fusion**. The most efficient method for a microcontroller is a Complementary Filter. This acts as a high-pass filter on the integrated gyroscope (trusting it for fast, short-term movements like brake dive) and a low-pass filter on the accelerometer (trusting its gravity vector for long-term absolute levelness).

First, calculate the absolute pitch from the accelerometer's gravity vector:
$$
\phi_{acc} = \text{atan2}(-a_x, \sqrt{a_y^2 + a_z^2})
$$

Next, fuse this with the gyroscope using a tuning parameter $\alpha$ (typically 0.95 to 0.99):
$$
\phi_n = \alpha \cdot (\phi_{n-1} + \omega_{y,n} \cdot \Delta t) + (1 - \alpha) \cdot \phi_{acc,n}
$$

*(Note: During hard longitudinal acceleration or braking where total $G \neq 1g$, the firmware dynamically forces $\alpha \to 0.999$ to ignore the corrupted accelerometer data).*

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

If a motorcycle hits a square-edged rock at 20 m/s, the wheel moves 80 mm horizontally between 250 Hz samples. Slower sampling rates will completely miss the peak velocity of the damping spike. (For high-end diagnostic products, 500 Hz to 1000 Hz is preferred).

### 9.2 Zero-Phase Filtering Requirement

Because velocity is calculated via a finite difference ($v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$), high-frequency noise is severely amplified. While a standard low-pass Butterworth filter cleans this noise, it introduces *group delay* (phase shift), making the velocity peak appear artificially late compared to the IMU G-spike. The software architecture must utilize **Zero-Phase Filtering** (forward-backward filtering) during post-processing to keep the time-domains perfectly aligned.

---

## 10. What Measurements Are Needed for Each Plot

### 10.1 Graph 1: Position or Travel Histogram
* **Required:** Ratiometric displacement ADC counts, calibration constants, total available wheel travel.
* **Derived:** $P_n = 100 \cdot \frac{W_n}{W_{max}}$

### 10.2 Graph 2: Velocity Histogram
* **Required:** Filtered displacement channel, accurate $\Delta t$.
* **Derived:** $v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$

### 10.3 Graph 3: Pitch Angle Versus Time
* **Required:** Gyroscope Y-axis, Accelerometer X/Y/Z axes, sample interval, sensor fusion algorithm.
* **Derived:** $\phi_n = \alpha \cdot (\phi_{n-1} + \omega_{y,n} \cdot \Delta t) + (1 - \alpha) \cdot \phi_{acc,n}$

---

## 11. Sensor-Channel Summary Table

| Channel | Measured Quantity | Primary Formula Dependencies | Primary Plot Dependencies |
| --- | --- | --- | --- |
| Front potentiometer | ADC Count (Ratiometric) | $s_{front} = \left( \frac{\text{ADC}}{2^N - 1} \right) \cdot s_{max}$ | Graph 1 & 2 front histograms |
| Rear potentiometer | ADC Count (Ratiometric) | $W_{rear} = a s_{rear}^2 + b s_{rear} + c$ | Graph 1 & 2 rear histograms |
| Gyroscope Y-axis | Pitch rate ($\omega_y$) | $\phi_n$ (Short-term fusion component) | Graph 3 pitch-angle trace |
| Accelerometer X/Y/Z | Gravity vector & Impact Gs | $\phi_{acc} = \text{atan2}(-a_x, \sqrt{a_y^2 + a_z^2})$ | Graph 3 pitch correction & Graph 2 context |
| Logger time base | Sample timing | $v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$ | Required for all histograms and rates |

---

## 12. Conclusion

Section 1 of the overview defines the DAQ hardware needed to make the rest of the suspension-analysis framework mathematically and physically valid. The transition from theory to a robust measurement tool requires mitigating real-world electrical noise through ratiometric ADC measurements and preventing mathematical drift through IMU sensor fusion. When these signal processing architectures are applied, the hardware yields high-fidelity displacement, velocity, and pitch data capable of supporting professional tuning decisions.