#!/bin/bash
for dir in ./database ./testing/k6 ./webserver ./websocket; do
    if [ -d "$dir" ]; then
        cp .env "$dir/.env"
    else
        echo "Directory $dir does not exist, skipping..."
    fi
done

echo "Copying .env to subdirectories completed."