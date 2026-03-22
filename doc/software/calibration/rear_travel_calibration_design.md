# Rear Travel and Linkage Calibration Screen Design

## Purpose

This document describes the software design for rear travel calibration. The rear channel is more complex than the front because it typically combines a sensor calibration step with a nonlinear linkage conversion step.

The target relationships are:

$$
s_{rear} = (V_{raw,rear} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear}(s_{rear}) = a s_{rear}^2 + b s_{rear} + c
$$

## User Goal

The user wants to know whether the rear raw sensor signal is being translated into physically correct rear wheel travel for the specific bike and linkage.

## Screen Inputs

The screen should expose:

- selected raw rear channel,
- zero reference capture,
- sensor stroke calibration table,
- rear stroke-to-wheel-travel table,
- polynomial fit controls,
- total rear wheel travel,
- sign convention selector.

## Workflow

1. Select the rear sensor channel.
2. Capture or enter $V_{0,rear}$.
3. Enter measured voltage-versus-stroke calibration pairs.
4. Fit the rear sensor conversion constant $C_{rear}$.
5. Enter measured stroke-versus-wheel-travel pairs $(s_i, W_i)$.
6. Fit the rear linkage relation:

$$
W_i \approx a s_i^2 + b s_i + c
$$

7. Preview the resulting travel curve and residuals.
8. Validate the output against known rear travel limits.
9. Save the rear profile element.

## Visual Elements

The screen should include:

- raw voltage preview,
- sensor stroke fit plot,
- wheel-travel fit plot,
- polynomial residual plot,
- wheel-travel preview from sample ride data.

## Validation Rules

The screen should warn if:

- too few rear calibration points are available,
- the fitted polynomial is non-monotonic over the valid stroke range,
- the resulting wheel travel exceeds the bike's known rear travel,
- residuals indicate a poor linkage fit,
- the sign convention implies extension during actual compression.

## Saved Outputs

The screen writes:

- rear sensor channel,
- $V_{0,rear}$,
- $C_{rear}$,
- linkage coefficients $a$, $b$, $c$,
- $W_{rear,max}$,
- sign convention,
- fit quality metrics.

## Confidence Indicators

The software should expose:

- number of voltage-stroke points,
- number of stroke-travel points,
- residual metrics for both fits,
- whether the polynomial was imported, fitted, or manually entered,
- date of last validation.