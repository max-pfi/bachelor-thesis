# Testing with k6
The script.ts file is used to perform load tests

# Startup
- Before running the tests, ensure that the webserver, the websocket server, and the database are running.
- The client application can be running, but it is not required.
- run `npm i` to install the required dependencies.
- run `npm run test` to execute the tests.


**Important**
The authenticationw process has just been implemented and the tests are not yet adapted to it.
-> so currently the test will fail
-> the tests will be adapted next