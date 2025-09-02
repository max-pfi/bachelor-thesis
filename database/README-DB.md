# PostgreSQL Database
This is a PostgreSQL database setup.

## Pre-requisites
- Docker needs to be installed and running

## Startup
- Use the top-level `setEnv.sh` script to copy the top-level `.env` file to this directory.
- Run `docker-compose up -d` to start the database.
    - the `data/init.sql` file is executed and the container for the database is created
    - a replication slot and publication for the message table is created automatically.
- Starting the database directly from this directory will make all CDC methods available.
    - To only enable one CDC method based on the `.env` file use the top level `start.sh` script that runs all components together.

## Mock Data
- Currently two users and a chat room are created on initialization.
    - You can use the username `max` or `john` in combindation with the password `password` to log in.


# Useful commands
`SELECT * FROM pg_publication;` - List all publications

`SELECT * FROM pg_subscription;` - List all subscriptions

`SELECT * FROM pg_replication_slots;` - List all active replication slots
```	
List all tables that are part of a publication
SELECT * 
FROM pg_publication_tables 
WHERE pubname = 'realtime';
``` 


