# Velocity Processing Design

## Purpose

This document describes how the software should help the user configure velocity calculation from calibrated displacement data. Velocity is highly sensitive to noise, sample rate, and filter selection, so this screen is part calibration and part signal-processing configuration.

The core relation is:

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

where $W_{f,n}$ is the filtered, calibrated travel sample at index $n$; the filter configuration on this screen defines how $W_{f,n}$ is derived from raw travel $W_n$.

## User Goal

The user wants a velocity trace and histogram that reflect true suspension motion rather than amplified sensor noise.

## Screen Inputs

The screen should expose:

- selected source travel channel,
- sample rate confirmation,
- differentiation method,
- pre-filter configuration,
- post-filter configuration,
- preview range selection,
- velocity sign convention.

## Workflow

1. Select the source travel channel.
2. Confirm or detect sample interval $\Delta t$.
3. Choose the differentiation method.
4. Configure filtering before differentiation if needed.
5. Configure filtering after differentiation if needed.
6. Preview the velocity trace and histogram.
7. Compare the result against raw travel events.
8. Save the chosen processing setup.

## Visual Elements

The screen should include:

- travel trace preview,
- velocity trace preview,
- velocity histogram preview,
- raw-versus-filtered comparison,
- zoomed event view for sharp impacts.

## Validation Rules

The screen should warn if:

- the chosen filter creates obvious phase distortion in the intended use case,
- the resulting velocity shows unrealistic spikes for the measured travel,
- the sample rate is too low for the chosen bandwidth,
- the travel source is not fully calibrated.

## Saved Outputs

The screen writes:

- source channel identity,
- $\Delta t$ or sample rate,
- differentiation method,
- pre-filter settings,
- post-filter settings,
- velocity validity state.

## Confidence Indicators

The software should expose:

- whether the source channel is fully calibrated,
- whether the filtering is offline-only or valid for real-time preview,
- peak velocity statistics before and after filtering,
- notes explaining why the current setup is marked valid or provisional.