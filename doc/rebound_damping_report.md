# Tuning Rebound Damping Using the Velocity Histogram and Telemetry: Interpretation, Reasoning, and Worked Examples

## Abstract

This report expands Section 4.3 of [overview.md](overview.md) by explaining how the rebound side of the velocity histogram, together with telemetry, is used to diagnose and correct rebound damping behavior. The objective is to clarify what rebound motion represents physically, why histogram symmetry matters, and how a tuner can distinguish excessive rebound damping that causes packing from insufficient rebound damping that causes pogo or kickback. Worked examples are included to show how similar ride complaints can point to opposite rebound adjustments.

---

## 1. Introduction

Section 4.3 of the overview uses Graph 2 and time-domain telemetry to guide rebound-damping changes. This is necessary because rebound damping controls how quickly the spring is allowed to re-extend after compression. If rebound is too slow, the suspension may fail to recover before the next bump. If rebound is too fast, the spring can release energy abruptly and destabilize the chassis.

Graph 2 is useful because rebound damping is fundamentally a velocity-controlled phenomenon. The rebound side of the histogram shows how often and how strongly the suspension is extending. Telemetry is required because the same histogram imbalance can have different real-world meanings depending on whether the bike is recovering from repeated bumps or oscillating after a single event.

---

## 2. What the Rebound Side of the Velocity Histogram Represents

The overview defines positive velocity as rebound. If the filtered displacement signal is $W_{f,n}$, then the discrete velocity estimate is

$$
v_n \approx \frac{W_{f,n} - W_{f,n-1}}{\Delta t}
$$

with the convention

$$
v_n > 0 \Rightarrow \text{rebound}
$$

The rebound side of the histogram is therefore the time-occupancy distribution of all positive velocity samples. If $M_k^{+}$ is the number of rebound samples falling in rebound bin $k$ and $N_v$ is the number of valid velocity samples, then the rebound occupancy is

$$
Y_k^{+} = 100 \cdot \frac{M_k^{+}}{N_v}
$$

This graph answers the question:

$$
\text{How fast, and how often, is the suspension extending after compression?}
$$

---

## 3. Why Rebound Damping Depends on Velocity

When the spring expands after compression, the damper must meter the return flow of oil so the extension is controlled rather than violent. In simplified form, rebound damping force is a function of rebound shaft velocity:

$$
F_r = f(v_{shaft})
$$

For an idealized viscous model,

$$
F_r = c_r \lvert v_{shaft} \rvert
$$

where $c_r$ is the rebound-damping coefficient. Real motorcycle dampers are non-linear and may use shim stacks, bleed circuits, and check valves, but the governing input variable remains rebound speed.

This is why the velocity histogram is the correct graph for rebound diagnosis. The travel histogram shows where the bike sits. The rebound-side velocity distribution shows how the bike comes back out of the stroke.

---

## 4. What Section 4.3 Means in Practice

Section 4.3 identifies two main rebound-damping symptoms:

1. packing caused by excessive rebound damping,
2. pogo or kickback caused by insufficient rebound damping.

These symptoms are opposites. One means the suspension cannot return quickly enough. The other means it returns too freely.

### 4.1 Packing

Packing occurs when the wheel is compressing repeatedly but the suspension does not recover enough extension between impacts. As a result, the bike gradually rides deeper into the stroke over successive bumps.

In histogram terms, the compression side grows larger than the rebound side because the suspension is moving inward more than it is returning outward. The overview summarizes this as the compression area being significantly larger than the rebound area.

The tuning implication is:

$$
\text{Packing} \Rightarrow \text{too much rebound damping}
$$

and the correction is to reduce or open rebound damping.

### 4.2 Pogo or Kickback

Pogo occurs when the suspension extends too quickly after a bump, overshoots the equilibrium region, and oscillates. In telemetry, the displacement trace often crosses the sag region, overshoots it, and continues into a visible oscillatory recovery.

This behavior means the spring's stored energy is not being dissipated sufficiently during extension.

The tuning implication is:

$$
\text{Pogo or kickback} \Rightarrow \text{too little rebound damping}
$$

and the correction is to increase or close rebound damping.

---

## 5. Why Histogram Symmetry Matters

The overview recommends looking at the symmetry of the velocity histogram. This is a practical way of comparing how much inward and outward motion the suspension experiences.

Let the total compression-side occupancy be

$$
A_c = \sum_{v_k < 0} Y_k
$$

and the total rebound-side occupancy be

$$
A_r = \sum_{v_k > 0} Y_k
$$

If the suspension is recovering appropriately over the ride segment, these areas should be reasonably balanced, acknowledging that exact equality is not required in every terrain condition.

The overview's interpretation can be stated conceptually as

$$
A_c \gg A_r \Rightarrow \text{packing tendency}
$$

because the system is entering compression more than it is returning from it.

However, symmetry alone is not enough to diagnose pogo. Pogo requires telemetry because it is identified by overshoot and oscillation in time, not just by a static area comparison.

---

## 6. Why Packing Points to Excessive Rebound Damping

If rebound damping is too high, the wheel cannot extend quickly enough after each bump. Consider successive impacts arriving before the suspension has recovered. The result is a progressively lower ride height through the bump sequence.

Mechanically, increasing rebound damping raises the opposing force during extension:

$$
F_r(v) \uparrow \Rightarrow \text{slower extension for the same spring force}
$$

If this force becomes excessive, extension recovery is delayed. The bike then starts the next impact already deeper in the stroke, which makes it feel harsh, dead, or stuck down.

That is why packing is corrected by decreasing rebound damping rather than adding more.

---

## 7. Why Pogo Points to Insufficient Rebound Damping

If rebound damping is too low, the spring releases energy too freely. After compression, the suspension extends rapidly and can overshoot the normal sag position.

This means the damping force opposing extension is too small:

$$
F_r(v) \downarrow \Rightarrow \text{faster extension for the same spring force}
$$

The result is an under-damped response. The wheel and chassis may bounce, kick upward, or oscillate after a single disturbance.

That is why pogo or kickback is corrected by increasing rebound damping.

---

## 8. How to Interpret Graph 2 and Telemetry Together

To use Section 4.3 correctly, the tuner should combine histogram balance with time-domain traces.

### 8.1 Interpretation Workflow

1. Compare the compression and rebound sides of the velocity histogram.
2. Determine whether rebound occupancy looks deficient relative to compression.
3. Inspect the displacement trace after single bumps.
4. Check whether the suspension overshoots sag and oscillates, or instead remains packed low over repeated impacts.

This leads to the main diagnostic logic:

$$
\text{Compression dominates + repeated deep-stroke operation} \Rightarrow \text{packing} \Rightarrow \text{reduce rebound}
$$

$$
\text{Overshoot and oscillation after a bump} \Rightarrow \text{pogo} \Rightarrow \text{increase rebound}
$$

### 8.2 Why Telemetry Is Essential

A histogram compresses time ordering into occupancy statistics. That is useful, but it hides event sequence. Packing is a repeated-event recovery problem. Pogo is a single-event overshoot problem. Those two behaviors can only be distinguished confidently by looking at displacement or chassis traces over time.

---

## 9. Worked Examples

### 9.1 Example 1: Packing on Repeated Washboard Bumps

Assume the bike is ridden across repeated small bumps. The compression side of the histogram is noticeably larger than the rebound side, and the travel trace shows the suspension stepping progressively deeper into the stroke without fully returning between events.

Interpretation:

- the suspension is not recovering quickly enough,
- rebound damping is too strong,
- the bike is packing down.

Likely correction:

- decrease rebound damping.

### 9.2 Example 2: Pogo After a Single Compression Event

Assume the bike hits a single bump. The displacement trace compresses, then extends rapidly beyond the sag position, then oscillates around the equilibrium point two or three times.

Interpretation:

- the spring return is under-controlled,
- rebound damping is too weak,
- the system is under-damped in extension.

Likely correction:

- increase rebound damping.

### 9.3 Example 3: Harsh Feeling That Is Actually Packing

Assume the rider reports harshness over repeated rough terrain. Telemetry shows the bike gradually riding lower through a sequence of bumps rather than kicking upward after each one.

Interpretation:

- the harsh feeling is not necessarily from too much compression damping,
- it may result from packing, which reduces available stroke and forces the bike into the stiffer part of travel,
- rebound damping is the correct parameter to inspect first.

Likely correction:

- decrease rebound damping slightly and retest.

---

## 10. How to Correct Rebound Damping Using the Graphs

### 10.1 For Packing

Use Graph 2 to identify an imbalance favoring compression occupancy and use telemetry to confirm incomplete extension recovery.

Corrective goal:

$$
F_r(v) \downarrow
$$

Practical action:

- open or reduce rebound damping.

Expected result on retest:

- improved extension recovery,
- reduced tendency to ride progressively deeper into the stroke,
- more balanced histogram symmetry.

### 10.2 For Pogo or Kickback

Use telemetry to identify overshoot and oscillation after a single bump or compression event.

Corrective goal:

$$
F_r(v) \uparrow
$$

Practical action:

- close or increase rebound damping.

Expected result on retest:

- smoother recovery to sag,
- less overshoot,
- reduced oscillation amplitude.

### 10.3 Retest Logic

After any rebound change, the suspension should be retested on repeatable terrain or repeatable maneuver inputs. The new data should be compared against the original graphs to determine whether:

- recovery is more balanced,
- oscillation has diminished,
- the bike remains compliant enough to follow the ground.

---

## 11. Practical Limits and Cautions

Rebound diagnosis should not be separated entirely from the rest of the setup.

Important cautions:

- Spring rate and preload influence how much extension recovery is available.
- Compression damping can alter the starting point from which rebound begins.
- Terrain type strongly affects histogram symmetry.
- A single test segment may overemphasize one behavior if the terrain is not representative.

For that reason, rebound adjustments should be made incrementally and interpreted with repeated test loops wherever possible.

---

## 12. Conclusion

Section 4.3 of the overview uses the rebound side of the velocity histogram and telemetry traces to distinguish between two opposite problems: rebound that is too slow, causing packing, and rebound that is too fast, causing pogo or kickback.

The core logic is straightforward. If compression activity accumulates faster than the bike can recover extension, rebound damping is too strong and should be reduced. If the bike overshoots sag and oscillates after a bump, rebound damping is too weak and should be increased.

This is why Graph 2 and telemetry must be used together. The histogram reveals rebound balance, while the time-domain trace reveals whether the suspension is failing to recover or recovering too violently.