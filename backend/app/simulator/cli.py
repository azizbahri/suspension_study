"""
Command-line interface for the suspension DAQ simulator.

Generates physically realistic DAQ CSV files from first principles so they
can be imported directly into the Suspension Study application.

Usage examples::

    # List available scenarios
    daq-simulate list

    # Static sag — default T7 bike, realistic noise
    daq-simulate static_sag sag.csv

    # Hard braking, 15 seconds, no noise
    daq-simulate braking /tmp/brake_run.csv --duration 15 --no-noise

    # Rough terrain, 60 s, custom seed for reproducibility
    daq-simulate rough_terrain /tmp/rough.csv --duration 60 --seed 7

    # Square-edge hit, custom front calibration constants
    daq-simulate square_edge /tmp/hit.csv --c-front 38.5 --v0-front 0.55

    # Repeated bumps with custom noise levels
    daq-simulate repeated_bumps /tmp/pack.csv \\
        --front-noise 2.0 --rear-noise 2.0 --gyro-noise 0.1

    # Jump and landing
    daq-simulate jump_landing /tmp/jump.csv --duration 8
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Scenario registry
# ---------------------------------------------------------------------------

_SCENARIO_HELP = {
    "static_sag": "Bike stationary at sag — pitch=0, constant displacement.",
    "braking": "Hard braking: sinusoidal deceleration, fork compresses, pitch nose-down.",
    "square_edge": "Square-edge impact: fast compression, exponential rebound.",
    "repeated_bumps": "Successive bumps with slow rebound → cumulative packing.",
    "jump_landing": "Both wheels extend mid-air (low az), landing shock on front.",
    "rough_terrain": "Band-limited Gaussian random travel (stochastic rough terrain).",
}

_DEFAULT_DURATIONS: dict[str, float] = {
    "static_sag": 4.0,
    "braking": 10.0,
    "square_edge": 5.0,
    "repeated_bumps": 10.0,
    "jump_landing": 10.0,
    "rough_terrain": 30.0,
}


# ---------------------------------------------------------------------------
# Argument parser
# ---------------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="daq-simulate",
        description=(
            "Generate synthetic DAQ CSV files that can be imported into the "
            "Suspension Study application.\n\n"
            "Run 'daq-simulate list' to see all scenarios."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    parser.add_argument(
        "scenario",
        choices=list(_SCENARIO_HELP) + ["list"],
        metavar="SCENARIO",
        help=(
            "Scenario to simulate. One of: "
            + ", ".join(_SCENARIO_HELP)
            + ". Use 'list' to show descriptions."
        ),
    )
    parser.add_argument(
        "output",
        nargs="?",
        metavar="OUTPUT",
        help="Output CSV file path (required for all scenarios except 'list').",
    )

    # ---- timing ----
    timing = parser.add_argument_group("timing")
    timing.add_argument(
        "--duration",
        type=float,
        default=None,
        metavar="SECONDS",
        help=(
            "Simulation duration in seconds. "
            "Defaults: static_sag=4, braking=10, square_edge=5, "
            "repeated_bumps=10, jump_landing=10, rough_terrain=30."
        ),
    )
    timing.add_argument(
        "--fs",
        type=float,
        default=250.0,
        metavar="HZ",
        help="Sample rate in Hz (default: 250).",
    )

    # ---- noise ----
    noise_grp = parser.add_argument_group("noise")
    noise_grp.add_argument(
        "--noise",
        dest="noise",
        action="store_true",
        default=True,
        help="Enable realistic sensor noise (default: enabled).",
    )
    noise_grp.add_argument(
        "--no-noise",
        dest="noise",
        action="store_false",
        help="Disable all sensor noise (clean signal for calibration tests).",
    )
    noise_grp.add_argument(
        "--seed",
        type=int,
        default=42,
        metavar="INT",
        help="Random seed for reproducible noise (default: 42).",
    )
    noise_grp.add_argument(
        "--front-noise",
        type=float,
        default=1.5,
        metavar="LSB",
        help="Front potentiometer ADC noise RMS in LSB (default: 1.5).",
    )
    noise_grp.add_argument(
        "--rear-noise",
        type=float,
        default=1.5,
        metavar="LSB",
        help="Rear potentiometer ADC noise RMS in LSB (default: 1.5).",
    )
    noise_grp.add_argument(
        "--gyro-noise",
        type=float,
        default=0.05,
        metavar="COUNTS",
        help="Gyro noise RMS in raw counts (default: 0.05).",
    )
    noise_grp.add_argument(
        "--gyro-bias",
        type=float,
        default=0.08,
        metavar="DEG/S",
        help="Constant gyro bias in deg/s (default: 0.08).",
    )

    # ---- bike profile ----
    bike_grp = parser.add_argument_group(
        "bike profile",
        "Calibration constants. Defaults match the Yamaha Ténéré 700 test profile.",
    )
    bike_grp.add_argument("--fork-angle", type=float, default=27.0, metavar="DEG",
                          help="Fork angle from vertical in degrees (default: 27).")
    bike_grp.add_argument("--c-front", type=float, default=42.0, metavar="MM/V",
                          help="Front linear calibration constant mm/V (default: 42).")
    bike_grp.add_argument("--v0-front", type=float, default=0.50, metavar="V",
                          help="Front voltage at zero stroke (default: 0.5).")
    bike_grp.add_argument("--c-rear", type=float, default=18.5, metavar="MM/V",
                          help="Rear linear calibration constant mm/V (default: 18.5).")
    bike_grp.add_argument("--v0-rear", type=float, default=0.40, metavar="V",
                          help="Rear voltage at zero stroke (default: 0.4).")
    bike_grp.add_argument("--linkage-a", type=float, default=-0.015, metavar="COEF",
                          help="Rear linkage quadratic coefficient A (default: -0.015).")
    bike_grp.add_argument("--linkage-b", type=float, default=4.20, metavar="COEF",
                          help="Rear linkage linear coefficient B (default: 4.20).")
    bike_grp.add_argument("--linkage-c", type=float, default=0.0, metavar="COEF",
                          help="Rear linkage constant offset C (default: 0).")
    bike_grp.add_argument("--v-ref", type=float, default=5.0, metavar="V",
                          help="ADC reference voltage (default: 5.0).")
    bike_grp.add_argument("--adc-bits", type=int, default=12, metavar="BITS",
                          help="ADC resolution in bits (default: 12).")
    bike_grp.add_argument("--gyro-sensitivity", type=float, default=16.4,
                          metavar="LSB/DPS",
                          help="Gyro sensitivity in LSB/deg/s (default: 16.4, MPU-6050 ±2000 dps).")
    bike_grp.add_argument("--accel-sensitivity", type=float, default=2048.0,
                          metavar="LSB/G",
                          help="Accelerometer sensitivity in LSB/g (default: 2048, MPU-6050 ±16 g).")

    return parser


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def _list_scenarios() -> None:
    print("Available scenarios:\n")
    for name, desc in _SCENARIO_HELP.items():
        default_dur = _DEFAULT_DURATIONS[name]
        print(f"  {name:<18}  (default {default_dur:g} s)  {desc}")
    print()


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.scenario == "list":
        _list_scenarios()
        return 0

    if args.output is None:
        parser.error(f"OUTPUT path is required for scenario '{args.scenario}'.")

    # Build output path, creating parent directories if needed
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Late imports so `daq-simulate list` works even if optional deps are absent
    from app.models.bike import BikeProfile
    from app.simulator.noise import NoiseConfig
    from app.simulator.physics import PhysicsModel
    from app.simulator.sensors import SensorModel
    from app.simulator.csv_writer import write_scenario_csv

    # Build a synthetic BikeProfile from CLI args
    bike = BikeProfile(
        name="CLI Bike",
        slug="cli_bike",
        fork_angle_deg=args.fork_angle,
        c_front=args.c_front,
        v0_front=args.v0_front,
        c_rear=args.c_rear,
        v0_rear=args.v0_rear,
        linkage_a=args.linkage_a,
        linkage_b=args.linkage_b,
        linkage_c=args.linkage_c,
        v_ref=args.v_ref,
        adc_bits=args.adc_bits,
        fs_hz=args.fs,
        gyro_sensitivity=args.gyro_sensitivity,
        accel_sensitivity=args.accel_sensitivity,
    )

    # Noise configuration
    if args.noise:
        noise = NoiseConfig(
            front_adc_rms=args.front_noise,
            rear_adc_rms=args.rear_noise,
            gyro_rms=args.gyro_noise,
            gyro_bias=args.gyro_bias,
            seed=args.seed,
        )
    else:
        noise = NoiseConfig(
            front_adc_rms=0.0,
            rear_adc_rms=0.0,
            gyro_rms=0.0,
            accel_rms=0.0,
            gyro_bias=0.0,
            seed=args.seed,
        )

    duration = args.duration if args.duration is not None else _DEFAULT_DURATIONS[args.scenario]

    model = PhysicsModel(
        fs=args.fs,
        duration_s=duration,
        linkage_a=args.linkage_a,
        linkage_b=args.linkage_b,
        linkage_c=args.linkage_c,
    )
    sensor = SensorModel(bike)

    scenario = args.scenario
    print(f"Generating '{scenario}' scenario → {output_path} ({duration:g} s @ {args.fs:g} Hz) …")

    if scenario == "static_sag":
        state = model.static_sag()
    elif scenario == "braking":
        state = model.braking_event()
    elif scenario == "square_edge":
        state = model.square_edge_hit()
    elif scenario == "repeated_bumps":
        state = model.repeated_bumps()
    elif scenario == "jump_landing":
        state = model.jump_and_landing()
    elif scenario == "rough_terrain":
        state = model.rough_terrain(duration_s=duration, seed=args.seed)
    else:
        # Should never reach here because argparse validates choices
        parser.error(f"Unknown scenario: {scenario}")

    write_scenario_csv(state, sensor, noise, output_path)

    n_samples = len(state.t)
    print(f"Done. Wrote {n_samples:,} samples to {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
