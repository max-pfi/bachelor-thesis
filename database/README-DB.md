# Database
- The docker-compose file starts a postgres database.


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


