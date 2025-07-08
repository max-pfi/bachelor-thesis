#!/bin/sh

# Wait for Postgres to be ready
until pg_isready -h postgres -p 5432 -U "$PG_USER"; do
  echo "Server waiting for Postgres..."
  sleep 3
done

exec "$@"