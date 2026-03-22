# DAQ Visualization Software Overview: A Product for Suspension Data Interpretation and Tuning Guidance

## Abstract

This report describes a software product that turns motorcycle suspension DAQ logs into interpretable visual analysis for engineers and serious motorcycle enthusiasts. The software is not a tuning simulator and not a control-system design tool. Its role is to ingest measured DAQ data, convert it into calibrated suspension channels, generate the key graphs described in the documentation set, and help the user interpret those graphs into informed tuning decisions. The focus is therefore on usability, clarity, diagnostic value, and confidence in the connection between measured data and mechanical action.

---

## 1. Purpose of the Software

The software exists to solve a specific problem: motorcycle suspension data is only useful if it can be transformed into a form that a rider, engineer, or tuner can understand quickly and trust technically.

A DAQ logger by itself only records raw channels such as:

- front sensor voltage,
- rear sensor voltage,
- accelerometer channels,
- gyroscope channels,
- timestamps or sample indices.

Those raw values are not directly useful to most users. The software's purpose is to bridge the gap between raw logs and mechanical decisions by performing the following sequence:

$$
\text{DAQ data} \rightarrow \text{calibrated channels} \rightarrow \text{graphs and telemetry} \rightarrow \text{engineering interpretation} \rightarrow \text{tuning decision support}
$$

---

## 2. What the Software Is

The software is a visualization and interpretation environment for motorcycle suspension DAQ data. It should feel like a specialized engineering analysis tool rather than a generic spreadsheet viewer.

Its core identity is:

- a ride-log viewer,
- a calibration-aware suspension analysis tool,
- a graphing environment for travel, velocity, and pitch telemetry,
- a decision-support application for suspension tuning.

It is not trying to replace rider feel. Instead, it gives rider feel an objective measurement context.

---

## 3. Intended Users

The primary users are:

- suspension engineers,
- race or test technicians,
- experienced off-road riders,
- mechanically literate motorcycle enthusiasts.

These users typically want answers to questions such as:

- Is the bike riding too deep or too high in the stroke?
- Is the spring rate correct?
- Is the fork diving too quickly under braking?
- Is the bike harsh on square-edge impacts?
- Is the rear packing or kicking back?
- How does one setup compare to another over the same test loop?

The software should therefore speak in engineering terms, but still remain usable by a knowledgeable rider who may not be a full-time data analyst.

---

## 4. Core Software Responsibilities

The software has four primary responsibilities.

### 4.1 Import Ride Data

The application must accept DAQ logs from the logger in a structured format such as CSV, binary export, or a logger-specific file format. The imported data should include at least:

- timestamps or uniform sample indices,
- front displacement channel,
- rear displacement channel,
- accelerometer channels,
- gyroscope channels.

### 4.2 Apply Calibration and Derived Calculations

Once imported, the software should convert raw DAQ channels into physical values using the calibration logic documented elsewhere in the repository. This should not depend on the user manually managing constants outside the application. The software should assist the user in creating, editing, and validating calibration profiles for each derived formula.

Examples include:

$$
W_{front} = (V_{raw} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

$$
s_{rear} = (V_{raw,rear} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear}(s_{rear}) = a s_{rear}^2 + b s_{rear} + c
$$

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

$$
\phi(t) = \phi(0) + \int_0^t \omega_{y,f}(\tau) \, d\tau
$$

In practical terms, the software should guide the user through the required constants behind these equations, including:

- front sensor offset $V_{0,front}$,
- front calibration factor $C_{front}$,
- fork-axis correction angle $\theta$,
- rear sensor offset $V_{0,rear}$,
- rear calibration factor $C_{rear}$,
- rear-linkage fit coefficients $a$, $b$, and $c$,
- pitch initial condition $\phi(0)$,
- filter settings used before differentiation or integration.

The calibration system should therefore be part of the product's core functionality, not an afterthought.

The detailed software-side design of this process is covered in [../calibration/calibration_profile_workflow.md](../calibration/calibration_profile_workflow.md).

### 4.3 Present the Key Diagnostic Graphs

The software must generate the graphs that the rest of the documentation relies on:

- position or travel histogram,
- velocity histogram,
- pitch-angle versus time telemetry trace.

### 4.4 Guide Interpretation

The software should not act as an autonomous tuner, but it should help the user connect graph behavior to likely setup changes. This means surfacing likely interpretations such as:

- histogram shifted right,
- excessive deep-travel tail,
- high-speed compression harshness indicators,
- brake-dive indicators,
- packing indicators,
- pogo indicators.

---

## 5. The User Workflow

The software should support a practical workflow that mirrors how real suspension work is done.

### 5.1 Step 1: Load a Session

The user imports one ride, one test segment, or a set of comparable sessions.

At this stage, the software should identify:

- sample rate,
- available channels,
- missing channels,
- obvious file errors or corrupted streams.

### 5.2 Step 2: Select or Confirm Bike Configuration

Because the framework depends on calibration and bike-specific constants, the user should select a setup profile that defines:

- front sensor calibration,
- rear sensor calibration,
- rear linkage polynomial constants,
- total available travel,
- sign conventions,
- filtering parameters.

If a profile does not already exist, the software should help the user create one through a guided calibration flow rather than expecting direct manual entry of every constant.

That flow should let the user:

- assign raw DAQ channels to physical sensors,
- enter measured reference positions,
- capture zero points,
- fit front and rear calibration constants,
- fit or import the rear motion-ratio polynomial,
- preview the effect of the profile on the derived channels,
- save the result as a reusable bike profile.

### 5.3 Step 3: Generate Derived Channels

The application computes:

- front and rear wheel travel,
- travel percentage,
- velocity,
- pitch angle,
- longitudinal acceleration in g,
- event markers or ride segments if requested.

### 5.4 Step 4: Inspect Graphs and Telemetry

The user examines the summary histograms and the time-domain traces. The software should make it easy to move from overview to detail.

### 5.5 Step 5: Interpret and Compare

The user should be able to compare:

- different rides,
- different spring rates,
- different clicker settings,
- different preload settings,
- front versus rear behavior in the same ride.

---

## 6. Main Features the Software Should Provide

### 6.1 Session Import and Validation

The import layer should:

- read DAQ files reliably,
- detect channel mapping,
- display sample rate and duration,
- flag missing channels,
- allow manual channel reassignment if needed.

### 6.2 Calibration Profile Management

The software should let the user save and reuse bike-specific profiles containing:

- sensor offsets,
- calibration constants,
- linkage polynomial coefficients,
- fork angle,
- total wheel travel,
- preferred filters,
- histogram bin settings.

This avoids forcing the user to re-enter engineering constants for every session.

More importantly, the software should help the user build those profiles correctly. A strong implementation would include a calibration workspace or wizard for each formula family used in the analysis.

Examples:

- Front travel calibration: map raw voltage to fork displacement, apply offset correction, and confirm angle compensation.
- Rear travel calibration: map raw voltage to shock displacement, then fit or verify the rear wheel-travel polynomial.
- Velocity calculation setup: choose differentiation method and the filtering applied before or after differentiation.
- Pitch calculation setup: define gyro axis, sign convention, bias correction, and initial pitch reference.
- Histogram setup: confirm total wheel travel and binning conventions so occupancy percentages are physically meaningful.

The user should be able to see, for each formula, both the symbolic form and the current calibrated values used by the software.

### 6.3 Derived Channel Generation

The application should compute the channels used throughout the documentation, including:

- wheel travel in mm,
- wheel travel as percentage of total stroke,
- velocity in mm/s,
- pitch angle in degrees,
- longitudinal acceleration in g.

These derived channels should only be marked as valid once their required calibration inputs are complete. If a required constant is missing, the software should clearly identify which formula is incomplete and which parameter still needs to be defined.

### 6.4 Graphing and Telemetry Views

The software should provide both summary views and detailed event views.

Summary views:

- travel histogram,
- velocity histogram,
- travel usage statistics,
- bottom-out or top-out occurrence counts.

Detailed views:

- pitch-angle versus time,
- travel versus time,
- velocity versus time,
- acceleration versus time,
- synchronized cursor inspection across channels.

Those views should remain calibration-aware. If the user changes a profile constant, the software should immediately show the effect on travel, velocity, pitch, and the related histograms so calibration errors can be caught early.

### 6.5 Comparative Analysis

A strong product feature is setup comparison. Users should be able to overlay or compare:

- before and after clicker changes,
- different springs,
- different terrain segments,
- multiple laps on the same route.

This is where the software becomes a real tuning tool instead of a passive chart viewer.

---

## 7. The Graphs the Software Must Make Central

The software should be built around the key graphs already defined in the documentation.

### 7.1 Position or Travel Histogram

This graph tells the user where the bike lives in the stroke.

Derived variable:

$$
P_n = 100 \cdot \frac{W_n}{W_{max}}
$$

Histogram percentage:

$$
Y_k = 100 \cdot \frac{N_k}{N}
$$

What the software should help the user see:

- dynamic sag region,
- deep-travel usage,
- bottom-out tendency,
- top-out tendency,
- differences between front and rear support.

### 7.2 Velocity Histogram

This graph tells the user how the suspension is moving, not just where it sits.

Derived variable:

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

What the software should help the user see:

- compression versus rebound balance,
- low-speed versus high-speed activity,
- harshness indicators,
- packing indicators,
- rebound overshoot behavior when cross-referenced with telemetry.

### 7.3 Pitch Telemetry Trace

This graph tells the user how the chassis handles load transfer over time.

Derived variables:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,f,n} + \omega_{y,f,n-1}}{2}\Delta t
$$

$$
A_{x,n}^{(g)} = \frac{a_{x,n}}{g}
$$

What the software should help the user see:

- braking dive,
- acceleration squat context,
- transient chassis attitude changes,
- alignment between pitch, travel, and acceleration events.

---

## 8. How the Software Helps Users Make Tuning Decisions

The software should not simply display charts. It should actively support interpretation.

That interpretation layer depends on sound calibration. For that reason, the software should distinguish between:

- conclusions drawn from fully calibrated channels,
- provisional views generated from incomplete or unverified calibration data.

This prevents the product from presenting weakly calibrated outputs with the same authority as verified engineering data.

### 8.1 Spring Rate and Preload Guidance

From Graph 1, the software can surface observations such as:

- ride height too low,
- ride height too high,
- excessive deep-travel tail,
- repeated bottom-out occupancy.

It can then suggest interpretation paths such as:

- likely preload issue,
- likely spring-rate issue,
- possible combined issue.

### 8.2 Compression Damping Guidance

From Graph 2 and Graph 3 together, the software can highlight:

- strong high-speed compression harshness signatures,
- excessive brake dive in low-speed compression,
- mismatch between impact severity and damping behavior.

### 8.3 Rebound Damping Guidance

From velocity symmetry and telemetry behavior, the software can highlight:

- packing tendencies,
- insufficient rebound control,
- overshoot and oscillation after events.

### 8.4 Interpretation Should Remain Advisory

The software should guide, rank, and explain, but not present itself as an unquestionable tuning oracle. Its recommendations should remain transparent and linked to measured graph features.

---

## 9. How the Software Should Feel to the User

The product should feel like a purpose-built engineering instrument.

That means:

- clear units everywhere,
- visible calibration status,
- obvious distinction between raw and derived channels,
- synchronized views,
- fast comparison between sessions,
- minimal ambiguity about sign conventions,
- confidence that a graph corresponds to a real physical quantity.

The user should feel that the software helps them think like a suspension engineer, even if they are primarily an advanced rider.

---

## 10. What the Software Is Not Trying to Do

To stay focused and usable, the software should avoid becoming too many things at once.

It is not primarily:

- a CAD package,
- a control-system design environment,
- a suspension finite-element model,
- an ECU flashing tool,
- a full workshop management system.

Its value comes from doing one job well: turning measured suspension data into trustworthy visual interpretation for tuning.

---

## 11. Practical Product Qualities

For the product to be credible, it should be:

- calibration-aware,
- calibration-assisted,
- tolerant of imperfect field data,
- explicit about missing or low-quality signals,
- usable by both professionals and serious enthusiasts,
- capable of comparing multiple sessions cleanly,
- focused on clarity over visual clutter.

It should also make calibration traceable. A user should always be able to answer:

- which constants were used,
- how they were obtained,
- when the profile was last updated,
- whether the profile was measured, fitted, or estimated.

The strongest version of this product is one that helps the user answer, with evidence:

$$
\text{What is the bike doing? Why is it doing that? What should I change next?}
$$

---

## 12. Example User Outcome

A typical successful use case would look like this:

1. The user imports a ride log from a test loop.
2. The software applies the bike's calibration profile.
3. The user sees that the front travel histogram is centered too deep in the stroke.
4. The velocity histogram shows low-speed compression concentration during braking.
5. The pitch trace confirms rapid nose-down rotation under deceleration.
6. The software highlights this as a likely low-speed compression and ride-height support problem.
7. The user adjusts preload or compression settings, repeats the loop, and compares the new session side-by-side.

That is the core product value: faster, more objective suspension iteration.

---

## 13. Conclusion

The software described here is a DAQ visualization and interpretation tool for motorcycle suspension development and setup work. It integrates the full workflow defined in the `doc` directory: calibrated channel generation, travel and velocity analysis, pitch telemetry, and graph-driven tuning interpretation.

Its purpose is not merely to display recorded numbers, but to convert those numbers into meaningful engineering insight. By helping the user move from raw DAQ logs to travel histograms, velocity distributions, pitch traces, and setup comparisons, the software becomes a practical bridge between measurement and tuning action.

For engineers, it provides a structured analysis environment. For serious enthusiasts, it provides a way to reason about suspension with the same quantitative tools. In both cases, the value of the product is the same: turning data into better suspension decisions.