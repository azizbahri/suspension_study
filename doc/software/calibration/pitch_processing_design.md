# Pitch Processing Design

## Purpose

This document describes how the software should guide the user in setting up pitch calculation from IMU data. Pitch is sensitive to axis assignment, sign convention, bias drift, and initial reference definition.

The core relation is:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,n} + \omega_{y,n-1}}{2} \Delta t
$$

## User Goal

The user wants a pitch trace that corresponds to real chassis attitude changes during braking, acceleration, and terrain events.

## Screen Inputs

The screen should expose:

- selected gyro axis,
- sign convention selector,
- stationary bias capture,
- initial pitch reference,
- optional drift-control settings,
- longitudinal acceleration cross-check channel.

## Workflow

1. Select the gyro channel used for pitch.
2. Confirm positive and negative rotation directions.
3. Capture or enter stationary gyro bias.
4. Define the initial pitch reference $\phi(0)$.
5. Preview the integrated pitch trace.
6. Cross-check pitch against acceleration and travel events.
7. Save the pitch-processing setup.

## Visual Elements

The screen should include:

- raw gyro trace,
- bias-corrected gyro trace,
- integrated pitch trace,
- pitch versus acceleration overlay,
- pitch versus front and rear travel overlay.

## Validation Rules

The screen should warn if:

- the chosen axis does not correlate with expected braking or acceleration behavior,
- sign convention is reversed,
- drift accumulates excessively over the preview segment,
- the initial reference is missing,
- the pitch output is being shown as validated without a stationary bias capture.

## Saved Outputs

The screen writes:

- pitch gyro channel,
- axis sign convention,
- gyro bias estimate,
- initial pitch reference,
- any drift-control settings,
- pitch validity state.

## Confidence Indicators

The software should expose:

- whether the bias was measured or estimated,
- drift rate over the preview segment,
- correlation with longitudinal acceleration and travel events,
- date of last validation.