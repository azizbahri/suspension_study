# Tuning Compression Damping Using the Velocity Histogram: Interpretation, Reasoning, and Worked Examples

## Abstract

This report expands Section 4.2 of [overview.md](overview.md) by explaining how the compression side of the velocity histogram is used to diagnose and correct compression damping behavior. The objective is to clarify what the negative side of Graph 2 means physically, why different parts of the compression-velocity distribution correspond to different damping circuits, and how a tuner can distinguish harsh high-speed compression from excessive low-speed brake dive. Worked examples are included to show how the same graph can point to different compression adjustments depending on the event context.

---

## 1. Introduction

Section 4.2 of the overview uses Graph 2, the velocity histogram, together with telemetry, to guide compression-damping changes. This is necessary because compression damping is not diagnosed well from ride height alone. A bike can sit at the correct ride height and still feel harsh on sharp impacts or collapse too quickly under braking.

The role of compression damping is to resist suspension motion during compression events. In practice, that means controlling how quickly the wheel and damper move into the stroke when the bike encounters braking loads, rider inputs, or terrain impacts.

Graph 2 is valuable because compression damping is primarily velocity-sensitive. The compression side of the histogram therefore reveals which kinds of compression events dominate the ride and whether the damper is too restrictive or too permissive in the relevant speed range.

---

## 2. What the Compression Side of the Velocity Histogram Represents

The overview defines the negative side of the velocity histogram as compression. If the filtered displacement signal is $W_{f,n}$, then the discrete velocity estimate is

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

with the convention that

$$
v_n < 0 \Rightarrow \text{compression}
$$

The compression side of the histogram is therefore the time-occupancy distribution of all negative velocity samples. If $M_k^{-}$ is the number of compression samples falling in negative-velocity bin $k$, and $N_v$ is the total number of valid velocity samples, then the bin percentage is

$$
Y_k^{-} = 100 \cdot \frac{M_k^{-}}{N_v}
$$

This graph answers the question:

$$
\text{How fast, and how often, is the suspension being driven into compression?}
$$

---

## 3. Why Compression Damping Depends on Velocity

Compression damping is produced when the damper piston forces oil through restrictive passages during inward stroke motion. In simplified form, the damping force can be written as a function of shaft velocity:

$$
F_c = f(v_{shaft})
$$

For an idealized viscous damper,

$$
F_c = c_c \lvert v_{shaft} \rvert
$$

where $c_c$ is a compression-damping coefficient. Real motorcycle dampers are more complex because they use different flow paths and shim behavior in different speed ranges, but the controlling variable remains compression velocity.

This is why the velocity histogram is the correct graph for diagnosing compression damping rather than the travel histogram. Spring and preload determine where the bike sits. Compression damping determines how fast it moves inward.

---

## 4. Low-Speed and High-Speed Compression: What These Terms Really Mean

In suspension tuning, low-speed and high-speed refer to suspension velocity, not motorcycle road speed.

If $v$ denotes suspension compression velocity, a practical partition is often written as

$$
\lvert v \rvert < v_{LS} \Rightarrow \text{low-speed compression regime}
$$

$$
\lvert v \rvert > v_{LS} \Rightarrow \text{high-speed compression regime}
$$

where $v_{LS}$ is an engineering threshold such as approximately 150 mm/s in the overview.

### 4.1 Low-Speed Compression

Low-speed compression is associated with:

- braking dive,
- throttle-induced pitch,
- rider body movement,
- gradual load transfer,
- rolling terrain inputs.

### 4.2 High-Speed Compression

High-speed compression is associated with:

- square-edge hits,
- rocks and roots,
- sharp landings,
- abrupt obstacle impacts.

The distinction matters because the damper may provide separate adjusters or internal flow mechanisms for these two regimes.

---

## 5. What Section 4.2 Means in Practice

Section 4.2 describes two primary compression-damping symptoms:

1. harshness from excessive high-speed compression restriction,
2. brake dive from insufficient low-speed compression support.

These symptoms appear in different parts of the data and must not be confused.

### 5.1 Symptom A: Harshness at the Extreme Compression Side

The overview describes a sharp, vertical cutoff on the extreme left side of the histogram combined with a large IMU spike. This means that very fast compression events are occurring, but the damper is resisting them so abruptly that impact energy is transmitted into the chassis instead of being absorbed progressively.

This is often described as hydraulic locking or spike harshness. The oil cannot move through the compression valving quickly enough, so the suspension feels rigid during sharp hits.

The tuning implication is:

$$
\text{Harsh high-speed compression behavior} \Rightarrow \text{reduce high-speed compression damping}
$$

or, in practical clicker language, open the high-speed compression adjuster if the hardware provides one.

### 5.2 Symptom B: Brake Dive in the Low-Speed Region

The overview also describes braking events where the pitch trace changes rapidly while the fork velocity remains in the low-speed zone, for example 50 to 100 mm/s. This means the bike is not experiencing a sharp impact. Instead, it is moving into the stroke under sustained load transfer.

If the fork compresses too quickly during these low-speed events, the low-speed compression circuit is too weak.

The tuning implication is:

$$
\text{Excessive low-speed dive} \Rightarrow \text{increase low-speed compression damping}
$$

or, in practical clicker language, close the low-speed compression adjuster by a small number of clicks.

---

## 6. How to Interpret the Compression Side of Graph 2

To use the histogram correctly, the tuner must examine both distribution shape and event context.

### 6.1 Distribution Shape Alone Is Not Enough

A concentration of samples on the negative side only proves that compression events are occurring. It does not, by itself, prove whether the system is harsh or under-damped. Context is required.

For that reason, Section 4.2 uses both:

- the left side of the velocity histogram,
- the time-aligned telemetry from Graph 3 and IMU channels.

### 6.2 What to Look For

The interpretation workflow is:

1. inspect where the negative velocity occupancy is concentrated,
2. determine whether the events are predominantly low-speed or high-speed,
3. correlate those events with pitch angle and acceleration telemetry,
4. decide whether the symptom is impact harshness or chassis dive.

This leads to the core diagnostic logic:

$$
\text{Large negative high-speed events + impact spike} \Rightarrow \text{too much high-speed compression}
$$

$$
\text{Large negative low-speed events + excessive brake pitch} \Rightarrow \text{too little low-speed compression}
$$

---

## 7. Why a Sharp Left-Side Cutoff Suggests Harshness

The overview refers to a sharp, vertical cutoff on the extreme left of the histogram. The underlying idea is that the suspension is being driven rapidly into compression, but instead of producing a smooth distribution of absorbed events, the damper behaves as if it meets a restrictive barrier.

This occurs when the compression circuit is too closed in the high-speed regime. The wheel cannot move freely enough into the stroke during impacts, so part of the impact force is transmitted directly to the chassis.

The accompanying IMU spike is important because it confirms that the rider and chassis are seeing a harsh acceleration event, not merely a fast but well-controlled suspension movement.

In practical tuning language:

$$
\text{High-speed harshness} \neq \text{need more support}
$$

It usually means the suspension needs less restriction in the relevant high-speed compression path.

---

## 8. Why Brake Dive Points to Low-Speed Compression

Brake dive is not usually a high-speed event in suspension terms. It is a controlled but significant weight-transfer event. The fork moves into compression because load shifts forward under deceleration.

If the pitch trace shows a rapid nose-down rotation and the fork velocity remains in a moderate range such as 50 to 100 mm/s, then the problem is not impact harshness. It is insufficient resistance to low-speed compression motion.

The relevant relationship is conceptual rather than exact: increasing low-speed compression raises the damping force opposing moderate compression speeds,

$$
v_{LS} \uparrow \Rightarrow F_c(v_{LS}) \uparrow
$$

so the fork compresses more slowly under braking load transfer.

This is why the overview recommends closing the low-speed compression clickers by a small amount.

---

## 9. Worked Examples

### 9.1 Example 1: Square-Edge Harshness

Assume the velocity histogram shows a noticeable cluster of compression events near $-300$ to $-450$ mm/s, and IMU data show large acceleration spikes at the same timestamps. The rider reports sharp hand impact on rocks and roots.

Interpretation:

- the relevant events are high-speed compression events,
- the impacts are being transmitted harshly,
- the compression circuit is too restrictive in the high-speed region.

Likely correction:

- decrease high-speed compression damping.

If there is no external high-speed adjuster, the mechanical alternatives may include oil viscosity change or internal valving revision, as noted in the overview.

### 9.2 Example 2: Braking Dive Without Impact Harshness

Assume the pitch trace reaches $-16^\circ$ during hard braking while fork velocity stays mainly between $-50$ and $-100$ mm/s, with no major impact spike in the IMU.

Interpretation:

- the compression motion is low-speed,
- the bike is diving too quickly under braking load transfer,
- the low-speed compression circuit is too weak.

Likely correction:

- increase low-speed compression damping by a small step, such as 2 to 3 clicks.

### 9.3 Example 3: Mixed Terrain With Both Symptoms

Assume the bike shows both:

- large nose-down pitch during braking, and
- severe sharp impacts on repeated square-edge bumps.

Interpretation:

- the low-speed compression support may be too weak,
- while the high-speed compression path may simultaneously be too restrictive.

This is possible because the low-speed and high-speed circuits do not have to be incorrect in the same direction.

Likely correction:

- increase low-speed compression slightly,
- decrease high-speed compression slightly,
- retest and compare the new histogram and telemetry traces.

---

## 10. How to Correct Compression Damping Using the Graphs

### 10.1 For High-Speed Harshness

Use Graph 2 and impact telemetry together.

If the compression-side tail is dominated by severe high-speed events and those events coincide with harsh IMU spikes, the corrective goal is to reduce force build-up in fast compression motion:

$$
F_c(v_{HS}) \downarrow
$$

Practical action:

- open or reduce high-speed compression damping.

### 10.2 For Brake Dive

Use Graph 2 and Graph 3 together.

If braking events generate excessive nose-down pitch while fork speed remains in the low-speed compression range, the corrective goal is to increase resistance to moderate compression speeds:

$$
F_c(v_{LS}) \uparrow
$$

Practical action:

- close or increase low-speed compression damping.

### 10.3 Retest Logic

After any change, the graphs should be re-recorded and compared. The expected outcomes are:

- after reducing high-speed compression, the harsh impact signature and extreme negative-side spike severity should diminish,
- after increasing low-speed compression, the braking pitch trace should become slower and less extreme while preserving acceptable bump compliance.

---

## 11. Practical Limits and Cautions

The graph-guided diagnosis should be used carefully.

Important cautions:

- Spring rate and preload can influence apparent compression behavior by changing where in the stroke impacts occur.
- Tire stiffness and pressure can alter harshness perception independently of damping.
- A single extreme event should not be used as the only basis for tuning changes.
- Clicker adjustments should be made incrementally and tested with repeatable inputs.

Thus, Graph 2 is a strong diagnostic tool, but it should be interpreted in combination with ride context and telemetry rather than in isolation.

---

## 12. Conclusion

Section 4.2 of the overview uses the compression side of the velocity histogram to answer a specific question: is the suspension too restrictive during fast impact compression, or too permissive during slow load-transfer compression?

The distinction is made by combining the negative side of Graph 2 with event context from IMU spikes and pitch telemetry. High-speed harshness points to excessive high-speed compression damping and should be corrected by opening that circuit. Brake dive in the low-speed range points to insufficient low-speed compression support and should be corrected by closing that circuit.

This is why Graph 2 is such a powerful tuning tool. It separates the inward suspension motion by speed regime, making it possible to diagnose not just that compression is occurring, but what kind of compression event is dominating the bike's behavior.