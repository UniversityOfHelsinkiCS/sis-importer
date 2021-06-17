#!/bin/bash

# Move downloading and other here

# Create new table
docker-compose up -d importer-test-db
docker exec importer-test-db psql -U postgres -c 'DROP DATABASE IF EXISTS "sis-importer-db";'
docker exec importer-test-db psql -U postgres -c 'CREATE DATABASE "sis-importer-db" WITH TEMPLATE "importer-db";'

# Run sampler
docker-compose up importer-test-db-mankeli
# TODO: make sample to quit after running

# vacuum!
docker exec importer-test-db psql -U postgres sis-importer-db -c 'VACUUM FULL;'

# And now we have created sample from importer db!
