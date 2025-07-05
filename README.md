# Real-time data synchronization application
## Description
This is a simple chat app as a prototype for a real-time data synchronization system using postgresql and websockets in nodejs.
The project consists of postgres database, a node.js web socket server, an express server for http requests and a react client. There is also a Grafana K6 test script for load testing the application.
Each project has its own readme. 

## Components
The postgres database stores all information about users, chats and messages. The express server provides a REST API for basic requests and login/registration. The websocket server provides updates in real-time from the database to the client. The client is a react application that provides a user interface for the application.

## Startup
Currently each project needs to be started separately. You can check the individual readme files for instructions on how to start each component. Full containerization and orchestration will be implemented at a later stage.
Except for the test script, all components need to be started. Best in the following order:
- Postgres database
- Express server
- Websocket server
- React client


## Current status (2025-06-23)
### What has been implemented
Client application, websocket server, webserver and database have all been implemented and are working together.
Currently only log-based CDC (with logical replication) is implemented and messages can just be created and not updated or deleted.
The basic testing script has been implemented but since the authentication process has just been implemented, the tests are not yet adapted to it.
### Next steps
- [x] Adjust the test script to work with the authentication process.
- [ ] Implement the other CDC methods and make the system more modular.
- [ ] Implement containerization and orchestration with docker-compose.
- [ ] Implement message updates and deletions.
- [ ] Handle backpressure and robustness of the websocket server.
- [ ] Deploy the application to a droplet and adjust the tests and logs to get meaningful results.
