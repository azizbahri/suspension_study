# Front Travel Calibration Screen Design

## Purpose

This document describes the software design for the front travel calibration screen. Its job is to turn the front raw DAQ channel into a trusted front wheel-travel signal using a controlled, visible, and repeatable workflow.

The target relationship is:

$$
W_{front} = (V_{raw,front} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

## User Goal

The user wants to answer a practical question: does this front sensor channel produce physically correct fork or wheel-travel data across the stroke?

## Screen Inputs

The screen should expose:

- selected raw front channel,
- displayed live voltage trace,
- zero reference capture,
- measured calibration-point table,
- fitted calibration constant,
- fork-angle correction input,
- front total wheel travel,
- sign convention selector.

## Workflow

1. Select the raw front sensor channel.
2. Verify live movement by compressing and extending the fork.
3. Capture or enter the zero reference voltage $V_{0,front}$.
4. Enter measured calibration pairs $(V_i, x_i)$.
5. Fit the front displacement relation:

$$
x_i \approx C_{front}(V_i - V_{0,front})
$$

6. Enter the fork-axis correction angle $\theta$.
7. Preview resulting wheel travel:

$$
W_{front} = x \cos(\theta)
$$

8. Validate limits and save the profile element.

## Visual Elements

The screen should include:

- raw voltage versus time preview,
- measured calibration-point table,
- fitted line plot of displacement versus voltage,
- residual plot,
- derived wheel-travel preview over a short sample.

## Validation Rules

The screen should warn if:

- fewer than two calibration points are entered,
- the fitted slope is negative when the sign convention expects positive compression,
- the fitted travel exceeds the known front travel limit,
- the zero reference lies outside the observed sensor range,
- residuals indicate poor linear fit quality.

## Saved Outputs

The screen writes the following profile values:

- front sensor channel,
- $V_{0,front}$,
- $C_{front}$,
- $\theta$,
- $W_{front,max}$,
- sign convention,
- fit quality metrics.

## Confidence Indicators

The software should expose:

- number of calibration points,
- residual RMS or equivalent fit metric,
- date of last calibration,
- whether the result was fitted or manually entered.