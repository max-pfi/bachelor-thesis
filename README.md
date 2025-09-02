# Real-time data synchronization application
## Description
This is a simple chat app as a prototype for a real-time data synchronization system using postgresql and websockets in nodejs.
The project consists of postgres database, a node.js web socket server, an express server for http requests and a react client. There is also a Grafana K6 test script for load testing the application.
Each project has its own readme. 

## Components
The postgres database stores all information about users, chats and messages. The express server provides a REST API for basic requests and login/registration. The websocket server provides updates in real-time from the database to the client. The client is a react application that provides a user interface for the application.

The test folder contains Grafana K6 test scripts for load and stress testing the application.

## Pre-requisites
Before starting the application, make sure you have the following installed:
- Docker
- Docker Compose
- Node.js

## Startup
First the top level `env.example` file needs to be copied to `.env` and the necessary environment variables need to be set. 
All components can be started together using the `start.sh` script. It copies the top-level `.env` file to each sub directory where it is needed. It then runs the main `docker-compose.yml` together with the correct override files to only implement the necessary CDC methods.

To start and stop all components individually run the `setupEnv.sh` script to also copy all environment variables to all subdirectories but without starting the application via docker-compose. Each component can then be started individually by following the instructions in the specific `Readme`. 

**Important:** The `PG_CONNECTION_STRING` needs to point either to `localhost` or the Docker service `postgres` depending on whether all is started via the top level docker-compose script or each component individually. 

## Database
Two users and a chat room are created on initialization. You can use the username `max` or `john` in combination with the password `password` to log in.


## CDC Methods
By using the the `start.sh` script the environment variable `CDC_TYPE` is used to switch between `trigger`, `replication` and `timestamp`. This variable influences both the WebSocket server and the database setup. 
