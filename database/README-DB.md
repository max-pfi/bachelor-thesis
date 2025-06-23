# PostgreSQL Database
This is a PostgreSQL database setup.

## Pre-requisites
- Docker needs to be installed and running

## Startup
- Copy the `.env.example` file to `.env` and adjust the variables as needed.
- Run `docker-compose up -d` to start the database.
    - the `data/init.sql` file is executed and the container for the database is created
    - a replication slot and publication for the message table is created automatically.

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


