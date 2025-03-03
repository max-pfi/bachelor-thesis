# Database
- The docker-compose file starts a postgres database.


# Config to enable logical replication
```
wal_level = logical
max_wal_senders = 10
max_replication_slots = 10
max_connections = 100
wal_sender_timeout = 60s
```

# Create publication and slot
``` 
CREATE PUBLICATION my_pub FOR TABLE test_table;
SELECT pg_create_logical_replication_slot('my_slot', 'pgoutput');
```

