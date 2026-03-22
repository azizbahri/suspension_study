# Advanced Data Acquisition (DAQ) Integration for Motorcycle Suspension Calibration: A Mathematical and Analytical Framework

**Abstract**
Motorcycle suspension calibration has historically relied on subjective rider feedback, introducing cognitive bias and inconsistency into the engineering process. This paper establishes a comprehensive, objective framework for utilizing Data Acquisition (DAQ) systems to interpret dynamic chassis and wheel states. By applying Newtonian kinematics to raw sensor data, we can generate graphical representations of suspension behavior and map these visualizations directly to mechanical tuning decisions, specifically tailored for modern adventure platforms like the Yamaha Ténéré 700.

---

## 1. Required Data Acquisition (DAQ) Hardware

To accurately capture the high-frequency dynamics of an off-road motorcycle, the DAQ system must meet stringent temporal and spatial resolution requirements.

### 1.1 Sensor Stack Specifications
* **Linear Potentiometers (Displacement Sensors):** * *Front Fork:* 250mm stroke sensor, mounted parallel to the fork leg.
    * *Rear Shock:* 75mm to 100mm stroke sensor, mounted parallel to the rear damper body.
    * *Resolution:* Analog voltage output (0-5V) converted via a 12-bit or 16-bit ADC (Analog-to-Digital Converter).
* **6-Axis Inertial Measurement Unit (IMU):** Mounted as close to the motorcycle's Center of Gravity (CG) as possible.
    * *Accelerometer:* Minimum $\pm 16g$ range to capture harsh bottom-out impacts.
    * *Gyroscope:* Minimum $\pm 500^\circ/s$ to capture pitch and roll rates.
* **Data Logger:** Must write to an SD card or solid-state memory at a minimum sampling rate of **250Hz** (4 milliseconds per sample) to prevent aliasing of high-speed damping events.

---

## 2. Mathematical Framework: Transforming Raw Data

Raw DAQ data consists of voltages and raw integer values. These must be transformed into physical, kinematic units before graphical analysis can occur.

### 2.1 Displacement Translation ($W$)
The linear potentiometers output a voltage. We must convert this to mechanical stroke, and then to true wheel travel.

For a detailed derivation of these relations, along with front and rear calibration procedures and an illustrative rear-linkage fit example, see [displacement_translation_report.md](displacement_translation_report.md).

**Front Suspension (Direct Acting):**
For traditional telescopic forks, the sensor stroke is virtually 1:1 with wheel travel when the potentiometer is mounted parallel to fork travel. In calibrated form, with voltage referenced to a zero position and fork angle $\theta$ treated as approximately constant:
$$W_{front} = (V_{raw} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)$$
*Where $V_{0,front}$ is the front-sensor zero offset, $C_{front}$ is the front calibration constant (mm/Volt), and the expression assumes direct acting fork motion and a near-constant fork angle over the working stroke.*

**Rear Suspension (Linkage Driven):**
Because modern motorcycles (like the Ténéré 700) utilize a progressive rear linkage, the relationship between calibrated shock stroke ($s$) and wheel travel ($W$) is non-linear. With shock stroke referenced to a defined datum, we use a second-order polynomial derived from a physical sweep calibration:
$$s_{rear} = (V_{raw,rear} - V_{0,rear}) \cdot C_{rear}$$
$$W_{rear}(s_{rear}) = a \cdot s_{rear}^2 + b \cdot s_{rear} + c$$
*Where $V_{0,rear}$ is the rear-sensor zero offset, $C_{rear}$ is the rear sensor calibration constant, and $a, b,$ and $c$ are bike-specific linkage constants valid for the measured motorcycle and setup.*

### 2.2 Velocity Calculation ($v$)
Damping forces are entirely dependent on the velocity of the damper shaft. We must calculate the instantaneous velocity by taking the first derivative of the displacement with respect to time:

For a detailed discussion of the derivative, discrete DAQ implementation, filtering, and wheel-versus-shaft velocity interpretation, see [velocity_calculation_report.md](velocity_calculation_report.md).

$$v(t) = \frac{d}{dt} W_f(t) \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}$$
*Where $W_f(t)$ is the filtered displacement signal, $\Delta t$ is the uniform sample interval, and the discrete form shown is a first-order backward-difference approximation. For linkage-driven systems, true damper-shaft velocity may require differentiating calibrated shock stroke rather than wheel travel.*

### 2.3 Chassis Pitch Angle ($\phi$)
To understand weight transfer, we integrate the IMU's Y-axis gyroscope data (pitch rate, $\omega_y$) over time:

For a detailed derivation of pitch-angle estimation, IMU signal conditioning, bias handling, and integration drift, see [pitch_angle_report.md](pitch_angle_report.md).

$$\phi(t) = \phi(0) + \int_{0}^{t} \omega_{y,f}(\tau) \, d\tau$$
*Where $\phi(0)$ is the initial pitch reference and $\omega_{y,f}(t)$ is the bias-corrected, filtered gyroscope pitch-rate signal. This formulation assumes the correct IMU axis has been selected and the sign convention has been validated against known braking and acceleration events.*

---

## 3. Graphical Analysis and Interpretation

Once the math is applied, the data is plotted into three primary graphs. These graphs are the core diagnostic tools for the suspension engineer.

For a detailed derivation of the histogram axes, telemetry axes, and graph-construction formulas, see [graphical_analysis_report.md](graphical_analysis_report.md).

### 3.1 Graph 1: Position/Travel Histogram
* **X-Axis:** Percentage of total wheel travel (0% = fully extended, 100% = bottomed out).
* **Y-Axis:** Percentage of total ride time spent at that travel position.
* **What it shows:** The overall dynamic ride height and spring rate effectiveness. A properly sprung bike will show a bell-like distribution centered around the dynamic sag point (roughly 30-40% of travel), with tapering tails toward 0% and 100%.

### 3.2 Graph 2: Velocity Histogram (The "Damping Curve")
* **X-Axis:** Damper velocity in mm/s. Negative values represent Compression (wheel moving up); positive values represent Rebound (wheel moving down).
* **Y-Axis:** Percentage of ride time.
* **What it shows:** The balance between compression and rebound, and the transition between low-speed and high-speed damping circuits.
    * *Low-Speed (< 150 mm/s):* Rider inputs, braking, chassis pitch.
    * *High-Speed (> 150 mm/s):* Rocks, roots, square-edge impacts.

### 3.3 Graph 3: Pitch Angle vs. Time (Telemetry Trace)
* **X-Axis:** Time (seconds).
* **Y-Axis:** Pitch Angle (degrees) overlaid with Longitudinal Acceleration (G-force).
* **What it shows:** How the chassis handles load transfer during hard braking and acceleration. 

---

## 4. Mapping Graphs to Tuning Decisions

### 4.1 Correcting Spring Rate and Preload (Using Graph 1)

For a detailed interpretation workflow, spring-versus-preload reasoning, and worked examples, see [spring_rate_preload_report.md](spring_rate_preload_report.md).

**Interpretation:** * If the Position Histogram is heavily skewed to the right (spending >10% of the time above 80% travel) and hitting 100% frequently, the bike is riding too low.
* If the histogram rarely passes 60% travel, the bike is riding too high.

**Tuning Decision:**
1.  If bottoming out but the center of the bell curve is correct (at 30%), the **Spring Rate ($k$)** is too soft. Replace the spring.
2.  If the entire bell curve is shifted to the right (e.g., centered at 50%), increase **Preload** to raise the static equilibrium point.

### 4.2 Tuning Compression Damping (Using Graph 2)

For a detailed explanation of compression-side velocity interpretation, low-speed versus high-speed reasoning, and example tuning decisions, see [compression_damping_report.md](compression_damping_report.md).

**Interpretation:** Look at the negative (left) side of the Velocity Histogram.
* *Symptom A (Harshness):* If there is a sharp, vertical cutoff on the extreme left (high-speed compression) and the IMU shows a massive G-spike at that exact timestamp, the damper is "hydraulically locking." The fluid cannot pass through the shims fast enough.
    * **Decision:** Decrease (open) **High-Speed Compression**. (If the T7 lacks a high-speed clicker, lighter fork oil or a shim stack re-valve is required).
* *Symptom B (Brake Dive):* Look at Graph 3. If braking (-0.8G) causes a rapid pitch change ($>15^\circ$) and the fork velocity is strictly in the low-speed zone (50-100 mm/s), the low-speed circuit is too weak.
    * **Decision:** Increase (close) **Low-Speed Compression** clickers by 2-3 clicks to slow the weight transfer.

### 4.3 Tuning Rebound Damping (Using Graph 2 & Telemetry)

For a detailed explanation of rebound-side velocity interpretation, packing versus pogo behavior, and example tuning decisions, see [rebound_damping_report.md](rebound_damping_report.md).

**Interpretation:** Look at the symmetry of the Velocity Histogram.
* *Symptom A (Packing):* If the area under the Compression curve is significantly larger than the Rebound curve, the wheel is compressing faster than it can extend. Over successive bumps, the suspension "packs down" into the stiffer part of the stroke.
    * **Decision:** Decrease (open) **Rebound** damping. The spring needs less restriction to push the wheel back to the ground.
* *Symptom B (Pogo/Kickback):* If the telemetry trace shows the displacement line overshooting the sag point and oscillating after a single bump, the system is under-damped. The spring is returning energy too violently.
    * **Decision:** Increase (close) **Rebound** damping to control the spring's extension.

---

## 5. Conclusion

By deploying linear potentiometers and IMU sensors, motorcycle suspension tuning transitions from a subjective art to applied physics. Interpreting the Position Histogram ensures the structural foundation (Spring Rate) is correct, while the Velocity Histogram acts as an onboard damper dynamometer, isolating fluid dynamics into distinct low-speed and high-speed tuning decisions.