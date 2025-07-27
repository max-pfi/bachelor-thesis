#!/bin/bash
for dir in ./database ./testing/k6 ./webserver ./websocket; do
    if [ -d "$dir" ]; then
        cp .env "$dir/.env"
    else
        echo "Directory $dir does not exist, skipping..."
    fi
done

echo "Copying .env to subdirectories completed."

source .env

COMPOSE_FILES="-f docker-compose.yml"
case "$CDC_TYPE" in
  replication)
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.override.replication.yml"
    ;;
  trigger)
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.override.trigger.yml"
    ;;
  timestamp)
    ;;
  *)
    echo "Unknown CDC_TYPE: $CDC_TYPE"
    exit 1
    ;;
esac

# Start Docker Compose
docker-compose $COMPOSE_FILES up --build &

DC_PID=$!

# docker-compose down and remove volumes on exit
trap "echo -e '\nStopping...'; docker-compose $COMPOSE_FILES down -v; exit 0" SIGINT

# Wait for docker-compose to finish
wait $DC_PID