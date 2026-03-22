# Calibration Profile Workflow for Suspension DAQ Software

## Abstract

This document defines how the software should help a user create, validate, and maintain calibration profiles for the suspension-analysis formulas used throughout the theoretical documentation. The calibration profile is the bridge between raw DAQ channels and physically meaningful outputs such as wheel travel, velocity, pitch, and histogram occupancy. If the profile is wrong, every downstream graph and tuning conclusion is weakened. For that reason, calibration must be treated as a guided workflow inside the software rather than a hidden settings page.

---

## 1. Purpose of the Calibration Profile

The calibration profile stores the constants, conventions, and validation state required to turn logged DAQ signals into engineering quantities.

At a minimum, the software uses the calibration profile to support:

$$
\text{raw DAQ channels} \rightarrow \text{calibrated physical signals} \rightarrow \text{derived analysis channels} \rightarrow \text{graphs and tuning interpretation}
$$

The profile therefore is not only metadata. It is part of the analytical model of the bike.

---

## 2. What a Calibration Profile Must Contain

The profile should contain all constants needed by the formulas used in the software.

### 2.1 Front Travel Parameters

For front wheel travel, the software depends on:

$$
W_{front} = (V_{raw,front} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

Required profile values:

- raw front sensor channel assignment,
- front sensor zero offset $V_{0,front}$,
- front displacement calibration constant $C_{front}$,
- fork-axis correction angle $\theta$,
- front total wheel travel $W_{front,max}$,
- sign convention for compression and extension.

### 2.2 Rear Travel Parameters

Rear travel is normally a two-stage conversion.

First, sensor voltage is translated into shock or sensor stroke:

$$
s_{rear} = (V_{raw,rear} - V_{0,rear}) \cdot C_{rear}
$$

Then sensor or shock stroke is translated into rear wheel travel using a linkage model:

$$
W_{rear}(s_{rear}) = a s_{rear}^2 + b s_{rear} + c
$$

Required profile values:

- raw rear sensor channel assignment,
- rear sensor zero offset $V_{0,rear}$,
- rear displacement calibration constant $C_{rear}$,
- rear-linkage coefficients $a$, $b$, and $c$,
- rear total wheel travel $W_{rear,max}$,
- sign convention for compression and extension.

### 2.3 Velocity Parameters

Velocity depends on both calibration and filtering choices:

$$
v_n \approx \frac{W_n - W_{n-1}}{\Delta t}
$$

Required profile values:

- source displacement channel,
- selected differentiation method,
- filter type,
- filter cutoff or smoothing parameters,
- whether filtering is applied before differentiation, after differentiation, or both,
- sample rate confirmation.

### 2.4 Pitch Parameters

Pitch calculation depends on IMU alignment and bias management:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,n} + \omega_{y,n-1}}{2} \Delta t
$$

Required profile values:

- gyro channel assignment,
- pitch-axis sign convention,
- gyro bias estimate,
- initial pitch reference $\phi(0)$,
- optional fusion or drift-control settings,
- acceleration channel assignment if cross-checking pitch with longitudinal events.

### 2.5 Histogram and Interpretation Parameters

The travel histogram depends on total wheel travel:

$$
P_n = 100 \cdot \frac{W_n}{W_{max}}
$$

The histogram itself depends on binning choices:

$$
Y_k = 100 \cdot \frac{N_k}{N}
$$

Required profile values:

- total travel for front and rear,
- valid analysis range,
- histogram bin width or number of bins,
- bottom-out threshold,
- top-out threshold.

---

## 3. Why the Software Must Assist Calibration

Entering constants manually is not enough. The software should help users generate correct constants from measured procedures.

There are three reasons.

### 3.1 Calibration Errors Propagate Everywhere

If $V_{0,front}$ is wrong, front travel is shifted.

If $C_{rear}$ or the rear polynomial is wrong, rear wheel travel is distorted.

If the filter choice is wrong, velocity histograms become misleading.

If gyro sign or bias is wrong, pitch interpretation becomes unreliable.

A software product that performs tuning interpretation must therefore expose calibration quality, not hide it.

### 3.2 Most Users Do Not Think in Raw Sensor Constants

Users usually think in terms of:

- fork fully extended,
- bike at ride height,
- shock moved by a measured distance,
- known wheel positions,
- stationary gyro bias capture.

The software should accept those physical reference actions and convert them into the required constants.

### 3.3 Calibration Must Be Repeatable

Profiles should be reusable across sessions, but also easy to revise after hardware changes such as:

- changing a sensor,
- moving a mount,
- changing linkage geometry,
- changing a fork or shock,
- modifying logger channels.

---

## 4. Recommended Calibration Workflow Inside the Software

The software should guide the user through a structured workflow.

### 4.1 Step 1: Identify the Bike and Sensor Layout

The user begins by defining the bike and hardware context:

- bike name and model,
- front and rear travel limits,
- sensor type on each channel,
- logger channel mapping,
- units and sign conventions.

This gives the profile a physical identity rather than a loose collection of constants.

### 4.2 Step 2: Map Raw Channels to Physical Sensors

The software should show incoming DAQ channels and let the user assign them to:

- front travel sensor,
- rear travel sensor,
- pitch gyro,
- longitudinal accelerometer,
- any optional channels.

The software should provide a live preview so the user can verify that the assigned channel actually moves when the motorcycle or sensor is moved.

### 4.3 Step 3: Capture Zero References

The next step is to capture or define zero points.

Examples:

- front sensor voltage at known fork reference position,
- rear sensor voltage at known shock reference position,
- gyro bias while stationary,
- pitch reference when the bike is held at the desired reference attitude.

The software should support either:

- direct entry of measured values,
- or capture from a logged static segment.

### 4.4 Step 4: Fit the Front Travel Conversion

For the front channel, the software should support a linear calibration procedure based on measured sensor output versus known displacement.

For example, with measured pairs $(V_i, x_i)$, the software can fit:

$$
x_i \approx C_{front}(V_i - V_{0,front})
$$

The user should see:

- the fitted constant,
- fit residuals,
- number of calibration points,
- whether the result is measured or manually entered.

If angle correction is required, the software should then apply:

$$
W_{front} = x \cos(\theta)
$$

and show the effect of the chosen angle.

Further detail for the front-specific screen is provided in [front_travel_calibration_design.md](front_travel_calibration_design.md).

### 4.5 Step 5: Fit the Rear Travel Conversion

For the rear channel, the software should separate sensor calibration from linkage calibration.

First, determine the rear sensor stroke:

$$
s_{rear} = (V_{raw,rear} - V_{0,rear}) \cdot C_{rear}
$$

Then determine wheel travel from measured stroke-travel pairs $(s_i, W_i)$ using a fit such as:

$$
W_i \approx a s_i^2 + b s_i + c
$$

The software should let the user:

- import measured sweep data,
- enter calibration pairs manually,
- visualize the fitted curve,
- inspect fit residuals,
- compare a new fit to an existing stored fit.

This is important because rear linkage behavior is bike-specific and usually nonlinear.

Further detail for the rear-specific screen is provided in [rear_travel_calibration_design.md](rear_travel_calibration_design.md).

### 4.6 Step 6: Configure Velocity Processing

Velocity is not calibrated only by sensor constants. It also depends on signal-processing choices. The software should therefore expose:

- the source displacement channel,
- the differentiation method,
- the filter method,
- filter bandwidth,
- preview of the resulting velocity trace.

The user should be able to verify that the selected method preserves real suspension events without turning noise into false high-speed motion.

Further detail for velocity setup is provided in [velocity_processing_design.md](velocity_processing_design.md).

### 4.7 Step 7: Configure Pitch Processing

Pitch setup should guide the user through:

- selecting the correct gyro axis,
- confirming positive and negative rotation directions,
- estimating stationary bias,
- setting the initial pitch reference,
- previewing the integrated pitch trace.

The software should also warn when drift becomes large enough that interpretation becomes questionable.

Further detail for pitch setup is provided in [pitch_processing_design.md](pitch_processing_design.md).

### 4.8 Step 8: Validate the Whole Profile

Before the profile is marked ready, the software should run validation checks such as:

- front travel stays within realistic limits,
- rear travel stays within realistic limits,
- static positions look plausible,
- histogram percentages are sensible,
- pitch remains consistent with braking and acceleration events,
- no required parameters are missing.

The software should distinguish between:

- complete and validated,
- complete but unverified,
- incomplete,
- estimated only.

### 4.9 Step 9: Save Provenance with the Profile

The profile should store not only constants but also their origin:

- measured,
- fitted from imported data,
- manually entered,
- estimated,
- copied from another bike.

This provenance matters because engineering confidence depends on how each constant was obtained.

---

## 5. User-Facing Features for Calibration Assistance

The calibration workflow should be visible and interactive.

### 5.1 Calibration Wizard

The software should provide a step-by-step wizard that walks the user through profile creation in a controlled order.

The wizard should:

- prevent skipping required dependencies,
- explain what physical measurement is needed at each step,
- show units clearly,
- show the formula currently being configured,
- provide an immediate preview of the effect of each entered value.

### 5.2 Calibration Workspace

For advanced users, the software should also provide a calibration workspace where they can:

- inspect raw and calibrated signals side by side,
- edit constants directly,
- refit curves,
- inspect residuals and errors,
- compare profile revisions.

### 5.3 Formula Dependency View

The user should be able to ask a simple question: what does this graph depend on?

For example, the software should show that a velocity histogram depends on:

$$
V_{raw} \rightarrow W \rightarrow v \rightarrow \text{histogram bins}
$$

This dependency view helps the user trace bad results back to the likely source.

### 5.4 Live Recalculation

When the user changes a calibration constant, the software should immediately update:

- travel traces,
- velocity traces,
- pitch traces,
- histogram occupancy,
- event statistics.

This is the fastest way to reveal whether a calibration change improves physical realism or makes the output less plausible.

---

## 6. Validity States the Software Should Expose

Every derived channel and graph should have a visible validity state.

Suggested states:

- valid,
- valid with estimated constants,
- incomplete calibration,
- inconsistent calibration,
- failed validation.

Examples:

- A rear travel plot may be marked incomplete if the linkage polynomial is missing.
- A pitch trace may be marked estimated if the initial reference was not measured.
- A velocity histogram may be marked inconsistent if the filter settings create unrealistic spikes.

This is essential because the software is intended to support engineering decisions, not just display lines on a chart.

---

## 7. Calibration Documented per Formula

The software should make it easy to inspect the exact calibrated equation used for each derived channel.

Examples:

Front travel:

$$
W_{front} = (V_{raw,front} - 1.742) \cdot 51.3 \cdot \cos(12.5^\circ)
$$

Rear wheel travel:

$$
W_{rear} = 0.018 s_{rear}^2 + 2.41 s_{rear} + 0.6
$$

Velocity:

$$
v_n = \frac{W_n - W_{n-1}}{0.004}
$$

Pitch:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,n} + \omega_{y,n-1}}{2} \cdot 0.004
$$

This makes the software auditable. The user can see both the formula form and the active constants.

---

## 8. Calibration Quality and Engineering Trust

The software should treat calibration quality as part of data quality.

The user should be able to answer:

- What constants were used?
- Were they measured, fitted, or estimated?
- How many reference points were used?
- What residual error did the fit produce?
- When was the profile last validated?
- Which graphs depend on this profile element?

Without this, the user may trust a graph that is numerically clean but mechanically wrong.

---

## 9. Conclusion

The calibration profile is central to the usefulness of the suspension DAQ software. It is the mechanism that turns raw voltages and IMU signals into travel, velocity, pitch, and histogram-based tuning insight. Because every important graph and interpretation depends on calibration, the software must help users build these profiles deliberately, transparently, and repeatably.

The correct product behavior is therefore not merely to store constants, but to guide the user through physical calibration procedures, validate the resulting formulas, expose data provenance, and clearly communicate confidence in the derived outputs. That is what turns the application from a chart viewer into a credible engineering tool.