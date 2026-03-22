# Graphical Analysis and Interpretation for Suspension DAQ: Histogram Construction, Axis Derivation, and Physical Meaning

## Abstract

This report expands Section 3 of [overview.md](overview.md) by formalizing the three diagnostic plots used in suspension data acquisition: the position or travel histogram, the velocity histogram, and the pitch-angle telemetry trace. The purpose is to explain what each graph means physically, why each graph is useful for suspension tuning, and how both axes are derived from measured DAQ channels. Particular attention is given to the histogram graphs, because their axes are not raw sensor outputs but statistical summaries of time-series data.

---

## 1. Introduction

After the raw DAQ channels have been converted into physical variables such as wheel travel, velocity, pitch angle, and acceleration, the resulting time series are not usually interpreted sample by sample. Instead, they are transformed into graphs that compress a large amount of ride data into patterns that are easier to diagnose.

The three graphs used in the overview serve different analytical purposes:

- Graph 1 summarizes where in the available travel range the suspension spends its time.
- Graph 2 summarizes how fast the suspension is moving, and in which direction.
- Graph 3 preserves time ordering and shows how pitch angle evolves during braking and acceleration events.

Together, these graphs convert raw motion signals into engineering evidence for spring-rate, preload, compression, and rebound decisions.

---

## 2. Data Prerequisites for the Graphs

Before any graph can be constructed, the DAQ channels must first be transformed into physical variables. Let the sampled data be indexed by $n = 0,1,2,\dots,N-1$ with uniform sample interval $\Delta t$. Then the primary derived channels are:

### 2.1 Wheel Travel

For the front suspension,

$$
W_{front,n} = (V_{front,n} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

For the rear suspension,

$$
s_{rear,n} = (V_{rear,n} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear,n} = a s_{rear,n}^2 + b s_{rear,n} + c
$$

### 2.2 Filtered Travel and Velocity

Let the filtered travel signal be $W_{f,n}$. Then velocity is estimated as

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

or, when the true damper-shaft quantity is needed, from the corresponding stroke signal.

### 2.3 Pitch Angle and Longitudinal Acceleration

Let the filtered pitch-rate signal be $\omega_{y,f,n}$. Then pitch angle is estimated as

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2} \Delta t
$$

Longitudinal acceleration is obtained from the accelerometer channel. If $a_{x,n}$ is measured in $\text{m/s}^2$, the corresponding value in g-units is

$$
A_{x,n}^{(g)} = \frac{a_{x,n}}{g}
$$

where $g \approx 9.81 \text{ m/s}^2$.

These derived channels are the inputs to the three graphs.

---

## 3. Graph 1: Position or Travel Histogram

### 3.1 What the Graph Means

The position histogram shows how often the suspension occupies each region of its available travel. It is therefore a probability-like distribution of suspension position over the duration of the ride.

This graph is useful because spring rate and preload determine the equilibrium ride height and how the system uses the available stroke. A histogram centered too deep in the travel suggests the bike is riding low. A histogram clustered too near top-out suggests the bike is riding high or not using enough travel.

### 3.2 X-Axis Derivation

The X-axis is not raw wheel travel in mm. It is wheel travel normalized as a percentage of total available travel.

If $W_n$ is wheel travel and $W_{max}$ is total available wheel travel, then the normalized travel percentage is

$$
P_n = 100 \cdot \frac{W_n}{W_{max}}
$$

where:

- $P_n = 0$ corresponds to full extension,
- $P_n = 100$ corresponds to full bottom-out.

If the histogram uses bins of width $\Delta P$, then the X-axis values plotted are the bin centers:

$$
P_k^{center} = P_{min} + \left(k + \frac{1}{2}\right)\Delta P
$$

for bin index $k$.

### 3.3 Y-Axis Derivation

The Y-axis is the percentage of total ride time spent in each travel bin.

Let $N_k$ be the number of samples whose normalized travel $P_n$ falls into bin $k$. If the total number of valid samples is $N$, then

$$
Y_k = 100 \cdot \frac{N_k}{N}
$$

This is equivalent to time percentage because the sample interval is constant. Since each sample represents a time increment $\Delta t$, the time spent in bin $k$ is

$$
T_k = N_k \Delta t
$$

and the total ride time is

$$
T_{tot} = N \Delta t
$$

so that

$$
Y_k = 100 \cdot \frac{T_k}{T_{tot}} = 100 \cdot \frac{N_k \Delta t}{N \Delta t} = 100 \cdot \frac{N_k}{N}
$$

### 3.4 Why This Graph Is Useful

The position histogram is a compact description of dynamic ride height. It answers the question: where in the stroke does the bike live most of the time?

The reasoning behind the graph is that spring rate and preload establish how static load, rider load, and dynamic load are supported. If the suspension spends too much time deep in the stroke, then the system may be too soft or under-preloaded. If it spends too much time near full extension, the system may be too stiff or over-preloaded.

### 3.5 Typical Interpretation Patterns

- A bell-like distribution near the target sag region suggests the ride height is broadly appropriate.
- A right-shifted distribution suggests excessive travel usage or insufficient support.
- A left-shifted distribution suggests inadequate travel usage or excessive support.
- Repeated occupancy near 100% indicates frequent bottoming.
- Repeated occupancy near 0% indicates top-out behavior or insufficient compliance.

---

## 4. Graph 2: Velocity Histogram

### 4.1 What the Graph Means

The velocity histogram shows how the suspension's motion is distributed by speed and direction. Rather than indicating where the suspension is, it indicates how fast it is moving and how much time is spent in compression versus rebound.

This graph is useful because damping is velocity-sensitive. Different portions of the histogram correspond to different hydraulic regimes inside the damper, including low-speed bleed-dominated motion and high-speed shim-dominated motion.

### 4.2 X-Axis Derivation

The X-axis is the suspension velocity, typically in mm/s. Using the filtered displacement signal, the discrete estimate is

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

If the histogram is intended to represent damper-shaft velocity rather than wheel velocity, then the differentiated signal should be calibrated shaft stroke rather than wheel travel.

With histogram bin width $\Delta v$, the plotted X-axis values are the velocity-bin centers:

$$
v_k^{center} = v_{min} + \left(k + \frac{1}{2}\right)\Delta v
$$

The sign convention adopted in the overview is:

- $v < 0$ for compression,
- $v > 0$ for rebound.

This convention is valid provided the displacement definition and sign inversion are handled consistently during processing.

### 4.3 Y-Axis Derivation

As with the position histogram, the Y-axis is the percentage of total ride time spent in each velocity bin.

Let $M_k$ be the number of samples whose velocity falls in bin $k$. Then

$$
Y_k = 100 \cdot \frac{M_k}{N_v}
$$

where $N_v$ is the number of valid velocity samples.

Because the sample rate is constant, this is also the percentage of total time spent at that velocity range:

$$
Y_k = 100 \cdot \frac{M_k \Delta t}{N_v \Delta t}
$$

### 4.4 Why This Graph Is Useful

The graph works because damping force is determined by motion speed. The velocity distribution therefore reveals which part of the damping map is active during the ride.

The low-speed region is dominated by rider inputs and chassis attitude changes. The high-speed region is dominated by terrain impacts. If the compression side is overly concentrated in the high-speed range and coincides with harsh IMU spikes, the suspension may be too restrictive in high-speed compression. If rebound motion is too small relative to compression, the suspension may be packing down.

### 4.5 Low-Speed and High-Speed Regions

The overview refers to approximate thresholds such as 150 mm/s. This is not a universal physical boundary, but a useful engineering partition for interpretation:

$$
|v| < v_{LS} \Rightarrow \text{low-speed regime}
$$

$$
|v| > v_{LS} \Rightarrow \text{high-speed regime}
$$

where $v_{LS}$ may be chosen around 150 mm/s for the application described.

### 4.6 Typical Interpretation Patterns

- Excessive negative high-speed occupancy suggests harsh compression events.
- A strong asymmetry with more compression than rebound area suggests packing.
- Large rebound tails may suggest excessive spring return or insufficient rebound control.
- Concentration near zero suggests the bike is spending much of its time in quasi-static chassis motion rather than rapid terrain response.

---

## 5. Graph 3: Pitch Angle Versus Time Telemetry Trace

### 5.1 What the Graph Means

The pitch trace is not a histogram. It is a time-domain telemetry plot that preserves event order. This is essential because load-transfer events such as braking entry, throttle pickup, and obstacle impact are transient and must be interpreted in sequence.

The pitch trace is usually overlaid with longitudinal acceleration so that chassis rotation can be interpreted against the input that caused it.

### 5.2 X-Axis Derivation

The X-axis is time in seconds. If the DAQ samples uniformly with interval $\Delta t$, then the sample times are

$$
t_n = n\Delta t
$$

If the logger writes absolute timestamps, the plotted time axis may be shifted so that

$$
t_n^{plot} = t_n - t_0
$$

This produces a time trace starting at zero.

### 5.3 Y-Axis Derivation

The primary Y-axis is pitch angle, obtained from filtered and bias-corrected pitch rate:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2}\Delta t
$$

If longitudinal acceleration is overlaid, it is typically plotted either on a secondary Y-axis or scaled for display. In g-units:

$$
A_{x,n}^{(g)} = \frac{a_{x,n}}{g}
$$

Thus the graph may contain two simultaneous dependent variables:

- pitch angle $\phi_n$ in degrees,
- longitudinal acceleration $A_{x,n}^{(g)}$ in g.

### 5.4 Why This Graph Is Useful

This graph reveals how quickly and how far the chassis rotates in response to braking and acceleration inputs. The reasoning is that suspension setup should not only absorb terrain but also control load transfer. A large nose-down pitch spike during braking indicates rapid forward weight transfer, often implicating front low-speed compression support and overall chassis balance.

Because this is a time-preserving graph, it allows the engineer to align pitch response with braking zones, impact events, and velocity spikes. That causal alignment cannot be extracted from a histogram alone.

### 5.5 Typical Interpretation Patterns

- Rapid negative pitch during braking suggests strong forward load transfer.
- Slow recovery after braking release may indicate rebound or chassis-balance issues.
- Oscillatory pitch after a single event may indicate under-damped chassis response.
- A strong correlation between negative longitudinal acceleration and nose-down pitch confirms braking-induced dive rather than terrain-only motion.

---

## 6. Why These Three Graphs Work Together

Each graph describes a different property of the same ride:

- Graph 1 describes position occupancy.
- Graph 2 describes motion-speed occupancy.
- Graph 3 describes transient event sequence and load transfer.

This separation is important because no single graph captures all relevant suspension behavior. A bike can show acceptable average ride height in Graph 1 while still showing harsh high-speed compression in Graph 2. Similarly, Graph 2 may show low-speed activity, but only Graph 3 can confirm whether that low-speed activity is caused by braking-induced pitch rather than terrain.

Mathematically, the three graphs are derived from different transforms of the same measured channels:

$$
W(t) \rightarrow \text{normalized occupancy histogram}
$$

$$
W(t) \rightarrow v(t) \rightarrow \text{velocity occupancy histogram}
$$

$$
\omega_y(t) \rightarrow \phi(t) \rightarrow \text{time-domain telemetry trace}
$$

---

## 7. Practical Construction Workflow

For each ride segment, the graph construction sequence is:

1. Acquire and synchronize all DAQ channels.
2. Convert raw channels to calibrated physical variables.
3. Filter displacement and gyroscope data as required.
4. Compute velocity and pitch angle.
5. Normalize wheel travel by total available stroke.
6. Select bin widths for travel and velocity histograms.
7. Count samples per bin and convert counts to time percentages.
8. Plot the pitch trace against time with longitudinal acceleration overlay.

For the histograms, the normalization step is what makes different rides comparable. For the telemetry trace, time alignment is what makes event diagnosis possible.

---

## 8. Conclusion

The graphical analysis section of the overview converts calibrated DAQ signals into three complementary diagnostic views. The position histogram measures where the suspension spends its time within the available stroke, the velocity histogram measures how fast the suspension moves and in which direction, and the pitch telemetry trace measures how the chassis rotates in response to longitudinal loading.

The X- and Y-axes of these graphs are not arbitrary plotting choices. They are derived directly from calibrated wheel-travel, velocity, pitch-rate, and acceleration signals. For the histogram plots, the vertical axis is a time-percentage distribution computed from sample counts. For the telemetry trace, the horizontal axis is sample time and the vertical axes are integrated pitch angle and longitudinal acceleration.

This is why the three graphs are effective engineering tools: each one compresses raw sensor data into a form that corresponds directly to a physical tuning question.

---

## Appendix A. Example Python Implementation

The following example shows one practical way to compute a travel histogram, a velocity histogram, and a pitch telemetry trace from already calibrated channels in Python.

```python
import numpy as np


def travel_percentage(wheel_travel_mm, total_travel_mm):
	return 100.0 * wheel_travel_mm / total_travel_mm


def backward_difference(signal, sample_rate_hz):
	dt = 1.0 / sample_rate_hz
	derivative = np.empty_like(signal, dtype=float)
	derivative[0] = np.nan
	derivative[1:] = np.diff(signal) / dt
	return derivative


def histogram_time_percentage(values, bins):
	counts, edges = np.histogram(values, bins=bins)
	percentages = 100.0 * counts / np.sum(counts)
	centers = 0.5 * (edges[:-1] + edges[1:])
	return centers, percentages


def trapezoidal_integrate(rate_signal, sample_rate_hz, initial_value=0.0):
	dt = 1.0 / sample_rate_hz
	integrated = np.empty_like(rate_signal, dtype=float)
	integrated[0] = initial_value
	for index in range(1, len(rate_signal)):
		integrated[index] = integrated[index - 1] + 0.5 * (rate_signal[index] + rate_signal[index - 1]) * dt
	return integrated


sample_rate_hz = 250.0
total_wheel_travel_mm = 210.0

# Example calibrated channels.
wheel_travel_mm = np.asarray([52.0, 54.0, 58.0, 63.0, 67.0, 64.0, 59.0, 55.0, 53.0])
pitch_rate_deg_s = np.asarray([0.0, -1.5, -4.0, -8.0, -12.0, -9.0, -4.0, -1.0, 0.0])
longitudinal_accel_g = np.asarray([0.0, -0.05, -0.20, -0.45, -0.80, -0.55, -0.25, -0.08, 0.0])

travel_percent = travel_percentage(wheel_travel_mm, total_wheel_travel_mm)
velocity_mm_s = backward_difference(wheel_travel_mm, sample_rate_hz)
pitch_angle_deg = trapezoidal_integrate(pitch_rate_deg_s, sample_rate_hz, initial_value=0.0)
time_s = np.arange(len(wheel_travel_mm)) / sample_rate_hz

travel_centers, travel_hist_percent = histogram_time_percentage(
	travel_percent,
	bins=np.arange(0.0, 110.0, 10.0),
)

valid_velocity_mm_s = velocity_mm_s[~np.isnan(velocity_mm_s)]
velocity_centers, velocity_hist_percent = histogram_time_percentage(
	valid_velocity_mm_s,
	bins=np.arange(-1000.0, 1000.0 + 100.0, 100.0),
)
```

This example assumes the channels have already been converted into physical units. In a full DAQ pipeline, the calibrated wheel-travel and pitch-rate signals would themselves be the outputs of the displacement and IMU processing stages described in the earlier notes.

---

## Appendix B. Synthetic Example Plots

The following synthetic examples show how the three graphs can be represented from a small demonstration dataset. The numbers are illustrative only, but the structure matches the graph definitions in the main report.

### B.1 Synthetic Position Histogram

Assume the normalized wheel-travel percentages yield the following time distribution:

| Travel Bin Center (%) | Ride Time (%) |
| --- | --- |
| 5 | 2 |
| 15 | 7 |
| 25 | 18 |
| 35 | 27 |
| 45 | 24 |
| 55 | 13 |
| 65 | 6 |
| 75 | 2 |
| 85 | 1 |

An ASCII-style visualization of the same histogram is:

```text
Travel %   Time %
  5        ##
 15        #######
 25        ##################
 35        ###########################
 45        ########################
 55        #############
 65        ######
 75        ##
 85        #
```

This synthetic shape is centered near the dynamic sag region and suggests broadly appropriate ride-height usage.

### B.2 Synthetic Velocity Histogram

Assume the differentiated suspension signal produces the following velocity occupancy:

| Velocity Bin Center (mm/s) | Ride Time (%) |
| --- | --- |
| -450 | 3 |
| -350 | 6 |
| -250 | 10 |
| -150 | 14 |
| -50 | 17 |
| 50 | 18 |
| 150 | 15 |
| 250 | 10 |
| 350 | 5 |
| 450 | 2 |

An ASCII-style visualization is:

```text
Velocity    Time %
-450        ###
-350        ######
-250        ##########
-150        ##############
 -50        #################
  50        ##################
 150        ###############
 250        ##########
 350        #####
 450        ##
```

This synthetic example is roughly symmetric, which is consistent with a balanced compression-rebound response.

### B.3 Synthetic Pitch Telemetry Trace

Assume a short braking event produces the following pitch-angle and longitudinal-acceleration data:

| Time (s) | Pitch Angle (deg) | Longitudinal Acceleration (g) |
| --- | --- | --- |
| 0.00 | 0.0 | 0.00 |
| 0.20 | -0.8 | -0.10 |
| 0.40 | -2.5 | -0.35 |
| 0.60 | -5.8 | -0.75 |
| 0.80 | -6.2 | -0.80 |
| 1.00 | -4.7 | -0.45 |
| 1.20 | -2.0 | -0.10 |
| 1.40 | -0.5 | 0.00 |

An ASCII-style view of the pitch trace is:

```text
Time (s)   Pitch (deg)
0.00       0.0
0.20      -0.8   *
0.40      -2.5      *
0.60      -5.8            *
0.80      -6.2             *
1.00      -4.7         *
1.20      -2.0    *
1.40      -0.5  *
```

This synthetic trace represents a braking-induced nose-down pitch event that peaks near the time of maximum negative longitudinal acceleration, then recovers as the braking load is released.