#!/bin/bash

docker-compose up --build &

DC_PID=$!

# docker-compose down and remove volumes on exit
trap "echo -e '\nStopping...'; docker-compose down -v; exit 0" SIGINT

# Wait for docker-compose to finish
wait $DC_PID