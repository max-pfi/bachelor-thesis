#!/bin/bash
for dir in ./database ./testing/k6 ./webserver ./websocket; do
    if [ -d "$dir" ]; then
        cp .env "$dir/.env"
    else
        echo "Directory $dir does not exist, skipping..."
    fi
done

echo "Copying .env to subdirectories completed."

docker-compose up --build &

DC_PID=$!

# docker-compose down and remove volumes on exit
trap "echo -e '\nStopping...'; docker-compose down -v; exit 0" SIGINT

# Wait for docker-compose to finish
wait $DC_PID