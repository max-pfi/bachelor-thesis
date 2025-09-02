# Testing with k6
The script.ts file is used to perform load tests

# Pre-requisites
- K6 needs to be installed on your machine
- Use the top-level `setEnv.sh` script to copy the top-level `.env` file to this directory.

# Project Structure
- The `script.ts` file contains the k6 script for actual testing (load and stress test)
- `loadTest.ts` and `stressTest.ts` are scripts that start and run the `script.ts` file with different configurations.
- `db-setup.ts` is a script that is used by `loadTest.ts` and `stressTest.ts` to set up the testing environment.
- `post-processing.ts` is a script that is used to process some of the load test results (others can be used directly)
- `testing/analysis` contains the following analysis notebooks:
  - `load-test-analysis.ipynb` -> uses the `analysis_x.csv` files to generate bar charts
  - `stress-test.ipynb` -> uses the `stress_x.json` files to generate a graph showing the message delta and cumulative user count
  - `resource-consumption.ipynb` -> uses the `stress_cpu_memory_x.json` files to generate a graph showing the CPU and memory usage over time

# Load Test
- The user count can be adjusted directly in the `loadTest.ts` file.
- The duration of the individual phases is adjusted based on the user count an can be manually overriden in the `script.ts` file.
- Ensure that webserver, the websocket server, and the database are running.
- run `npm run load-test [runNumber]` where [runNumber] is an optional run number to be used in the creation of log files
- the database will be reset and set up and the load test will be executed.
- the results will be saved in the `testing/analysis/data/` directory and can be further analyzed using the provided `.ipynb` files in the `testing/analysis` directory.

# Stress Test
- The user count can be adjusted directly in the `stressTest.ts` file.
- The duration of the individual phases is adjusted based on the user count an can be manually overriden in the `script.ts` file.
- Ensure that webserver, the websocket server, and the database are running.
- run `npm run stress-test [runNumber]` where [runNumber] is an optional run number to be used in the creation of log files
- the database will be reset and set up and the stress test will be executed.
- the results will be saved in the `testing/analysis/data/` directory and can be further analyzed using the provided `.ipynb` files in the `testing/analysis` directory.