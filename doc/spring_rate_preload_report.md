# Correcting Spring Rate and Preload Using the Position Histogram: Interpretation, Reasoning, and Worked Examples

## Abstract

This report expands Section 4.1 of [overview.md](overview.md) by explaining how the position or travel histogram is used to distinguish spring-rate problems from preload problems. The objective is to clarify what the histogram means physically, how it should be interpreted, why spring rate and preload affect the graph differently, and how a tuner can use the graph to decide which parameter to change. Worked examples are included to show how similar-looking ride-height problems can imply different corrective actions.

---

## 1. Introduction

Section 4.1 of the overview uses Graph 1, the position or travel histogram, to guide two basic chassis-support decisions:

- whether the spring rate is appropriate, and
- whether the preload setting places the suspension at the correct operating point.

This is a useful distinction because both a soft spring and insufficient preload can make a motorcycle appear to ride low, but they are not the same problem. Spring rate determines how much extra force is required for each additional unit of compression. Preload sets the initial installed compression of the spring and therefore shifts the static operating point.

In practical terms, spring rate governs support stiffness, while preload governs starting position.

---

## 2. What the Position Histogram Represents

The position histogram is a time-occupancy distribution of wheel travel. If $W_n$ is the wheel travel at sample $n$ and $W_{max}$ is the total available wheel travel, then the normalized travel percentage is

$$
P_n = 100 \cdot \frac{W_n}{W_{max}}
$$

The histogram groups these normalized travel values into bins and reports how much of the ride is spent in each bin. If $N_k$ samples fall in bin $k$ and the total number of valid samples is $N$, then the ride-time percentage for that bin is

$$
Y_k = 100 \cdot \frac{N_k}{N}
$$

The result is a distribution that answers the question:

$$
\text{Where in the available travel range does the bike spend most of its time?}
$$

This graph does not directly show force, but it reveals how the spring system supports the combined loads of bike mass, rider mass, braking, acceleration, and terrain input.

---

## 3. Why Spring Rate and Preload Affect the Histogram Differently

To interpret the graph correctly, the roles of spring rate and preload must be separated.

### 3.1 Spring Rate

For a linear spring,

$$
F_s = kx
$$

where:

- $F_s$ is spring force,
- $k$ is spring rate,
- $x$ is spring compression relative to the spring's free length reference.

A larger value of $k$ means more force is required for each unit of compression. A smaller value of $k$ means the spring compresses more easily under the same additional load.

### 3.2 Preload

Preload is the initial compression built into the spring during installation. If the installed preload compression is $x_p$, then the spring force becomes

$$
F_s = k(x_p + x)
$$

This means preload adds an initial force offset

$$
F_{preload} = kx_p
$$

before the wheel encounters any further dynamic displacement.

### 3.3 The Key Diagnostic Difference

Changing preload primarily shifts the operating point of the suspension within the travel range. Changing spring rate alters how quickly the suspension sinks deeper into the stroke as load increases.

That is why the histogram responds differently:

- preload tends to move the whole distribution left or right,
- spring rate tends to change how much of the distribution spills into deep travel and bottom-out zones.

This distinction is the basis of Section 4.1.

---

## 4. What Section 4.1 Means in Practice

The overview states two main diagnostic observations:

1. If the histogram is heavily skewed to the right and frequently reaches the deepest travel regions, the bike is riding too low.
2. If the histogram rarely reaches moderate or deep travel, the bike is riding too high.

These statements mean that the suspension's operating position is not centered appropriately within its available stroke.

For a correctly supported motorcycle, the histogram should generally concentrate around the dynamic sag region, often approximately 30% to 40% of total wheel travel for the application described in the overview. That means the suspension has enough room to extend into depressions and enough room to compress into bumps.

If the bike lives too deep in the stroke, it has lost compression reserve. If it lives too high in the stroke, it has lost extension reserve and may not track the ground well.

---

## 5. How to Interpret the Histogram for Spring Rate and Preload

The critical task is to determine whether the graph is showing a position error, a support-capacity error, or both.

### 5.1 Case A: Histogram Shifted Right but Still Structured Normally

Suppose the bell-shaped center of the histogram is located too far to the right, for example around 50% travel instead of around 30% to 40%, but the histogram is not excessively piled into the 90% to 100% bottom-out region.

This usually indicates that the bike's equilibrium ride height is too low, but the spring is not necessarily catastrophically under-rated. The suspension is simply starting from the wrong place in the stroke.

In that case, the likely correction is preload adjustment.

Reasoning:

- the whole distribution has moved deeper into the travel range,
- the shape remains broadly similar,
- the bike needs a higher static support position more than a fundamentally stiffer spring.

### 5.2 Case B: Histogram Center Correct but Deep-Travel Tail Excessive

Suppose the center of the histogram remains near the desired dynamic sag region, but the deep-travel tail is too large, with frequent occupancy above 80% and repeated hits near 100%.

This indicates that the average ride height may be acceptable, but the suspension does not have enough additional support when loads increase. Under impacts or heavy loading, it collapses too deeply into the stroke.

In that case, the likely correction is spring-rate change rather than preload.

Reasoning:

- the operating point is approximately correct,
- but the slope of force support with added load is too low,
- therefore the spring is too soft for the actual dynamic demands.

### 5.3 Case C: Histogram Shifted Right and Frequently Bottoming

If the histogram is both centered too deep and shows a large deep-travel or bottom-out tail, then both preload and spring rate may be inadequate.

In practice, the normal sequence is:

1. verify sag and ride-height targets,
2. determine whether preload required to hit target sag is already excessive,
3. if so, fit a stiffer spring rather than masking the problem with preload alone.

### 5.4 Case D: Histogram Too Far Left

If the histogram rarely exceeds moderate travel, then the bike is riding too high in the stroke. This may indicate:

- excessive preload,
- an overly stiff spring,
- or both.

In that case, the correction may be to reduce preload first if the distribution is simply shifted, or reduce spring rate if the system remains resistant to using travel even with reasonable preload settings.

---

## 6. Why Preload Does Not Truly Fix an Undersprung Bike

This is one of the most important points in suspension tuning.

Preload increases initial spring force, but for a linear spring it does not change the slope $k$ of the force-displacement curve. It changes the intercept, not the rate of support increase with additional travel.

If the spring law is

$$
F_s = k(x_p + x)
$$

then increasing preload changes $x_p$, but the derivative with respect to additional displacement remains

$$
\frac{dF_s}{dx} = k
$$

Therefore, if the spring is too soft in the dynamic sense, extra preload may raise the ride height but it does not supply the additional incremental support needed deeper in the stroke. That is why an undersprung bike can still bottom even after preload is increased.

---

## 7. Practical Interpretation Workflow

When reading Graph 1, a tuner should work through the following sequence:

1. Identify the histogram center or dominant peak.
2. Compare that center to the target dynamic sag region.
3. Inspect the deep-travel tail above about 80% of total travel.
4. Check whether bottom-out occurrences near 100% are isolated or frequent.
5. Decide whether the issue is primarily a distribution shift or excessive deep-stroke usage.

This leads to the basic interpretation logic:

$$
\text{Shift without severe tail growth} \Rightarrow \text{preload problem}
$$

$$
\text{Correct center with excessive deep tail} \Rightarrow \text{spring-rate problem}
$$

$$
\text{Shift plus severe deep tail} \Rightarrow \text{possible spring-rate and preload problem}
$$

---

## 8. Worked Examples

### 8.1 Example 1: Bike Riding Low but Not Repeatedly Bottoming

Assume a rear travel histogram has a dominant peak around 50% travel with only occasional occupancy above 80% and almost no samples at 100%.

Interpretation:

- the bike is riding too low on average,
- but it is not strongly saturating the stroke,
- the operating point is too deep.

Likely correction:

- increase preload.

Reasoning:

- the graph suggests a ride-height shift more than a support-capacity failure,
- increasing preload should move the distribution leftward toward the desired sag region.

### 8.2 Example 2: Bike Centered Correctly but Frequently Bottoming

Assume the histogram peaks around 32% travel, which is near target, but the deep-travel tail is unusually large and 12% of all ride time is spent above 80% travel with repeated contact near 100%.

Interpretation:

- average ride height is approximately correct,
- but the bike lacks sufficient support under larger dynamic loads.

Likely correction:

- fit a stiffer spring.

Reasoning:

- the bike starts in the right part of the stroke,
- but the spring does not resist additional compression strongly enough,
- more preload would not fix the underlying lack of rate.

### 8.3 Example 3: Bike Riding High and Not Using Travel

Assume the histogram peaks around 18% travel and rarely exceeds 60% travel even on rough terrain.

Interpretation:

- the bike is riding high,
- the suspension is under-using available stroke.

Likely correction:

- reduce preload first.

If preload is already near minimum and the problem remains, then the spring may be too stiff for the load case.

### 8.4 Example 4: Both Too Low and Too Deep

Assume the histogram peak is around 48% travel and the distribution also has a heavy tail near bottom-out.

Interpretation:

- the bike rides too low in the stroke,
- and it also lacks enough dynamic support deeper in the stroke.

Likely correction:

- verify sag,
- avoid adding extreme preload to compensate,
- select a stiffer spring if the correct sag target cannot be reached without excessive preload.

---

## 9. How to Correct Spring Rate and Preload Using the Graph

### 9.1 Correcting Preload

Use preload correction when the histogram indicates that the suspension's equilibrium position is wrong but the overall travel usage remains structurally reasonable.

Target effect on the graph:

- increase preload to shift the histogram left, toward less used travel,
- decrease preload to shift the histogram right, toward more used travel.

In idealized form,

$$
P_n^{new} \approx P_n - \Delta P_{preload}
$$

for an increase in preload, where $\Delta P_{preload}$ denotes the approximate leftward shift in normalized travel percentage.

This is only a conceptual representation, but it captures the purpose of preload tuning: reposition the operating point.

### 9.2 Correcting Spring Rate

Use spring-rate correction when the histogram indicates that the bike uses too much deep travel despite an approximately correct operating point, or when reasonable preload settings cannot achieve the target distribution.

Target effect on the graph:

- reduce the area in the deep-travel tail,
- reduce repeated occupancy near bottom-out,
- preserve an acceptable central operating region.

Increasing spring rate changes the force response to added displacement. For the same incremental dynamic load $\Delta F$,

$$
\Delta x = \frac{\Delta F}{k}
$$

so a larger $k$ yields less additional compression:

$$
k \uparrow \Rightarrow \Delta x \downarrow
$$

That is the mechanical reason a stiffer spring reduces deep-stroke occupancy.

---

## 10. Practical Limits and Cautions

The histogram is powerful, but it should not be used in isolation.

Important cautions:

- A travel histogram reflects the specific terrain, rider, speed, and payload of the test.
- Damping can influence the histogram indirectly by changing how quickly the suspension returns or settles.
- Bottoming from singular extreme impacts should be distinguished from chronic support deficiency.
- Sag measurements and rider-static checks should be used alongside the histogram.

Thus, the graph should be treated as a strong diagnostic tool, not as the only piece of evidence.

---

## 11. Conclusion

Section 4.1 of the overview uses the position histogram to distinguish between two fundamentally different tuning corrections: shifting the suspension's operating point with preload, and changing the support stiffness with spring rate.

The core logic is simple. If the whole histogram is displaced too far into the stroke, the bike is likely operating at the wrong ride height and preload is the first correction. If the histogram is centered acceptably but still shows too much deep-travel usage and bottoming, the spring rate is too soft and the spring itself must change.

This distinction matters because preload changes initial spring force but does not change the spring rate $k$. The position histogram makes that distinction visible by showing whether the bike is merely positioned incorrectly in the stroke or whether it fundamentally lacks support under dynamic load.