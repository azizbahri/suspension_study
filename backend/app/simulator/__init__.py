"""
Suspension DAQ hardware simulator.

Generates physically realistic DAQ CSV files from first principles:

    PhysicsModel → StateDict (true physical arrays)
        → SensorModel (inverts calibration chain → 12-bit ADC counts)
        → NoiseConfig (Gaussian + gyro bias)
        → write_scenario_csv (DAQ-format CSV)

Available as a command-line tool after installation::

    daq-simulate --help
"""
