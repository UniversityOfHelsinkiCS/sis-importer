#!/bin/bash

# Create new table
docker-compose up -d importer-test-db
docker exec importer-test-db psql -U postgres -c 'DROP DATABASE IF EXISTS "importer-test-db-sample";'
docker exec importer-test-db psql -U postgres -c 'CREATE DATABASE "importer-test-db-sample" WITH TEMPLATE "importer-db";'

# Run sampler
docker-compose up importer-test-db-mankeli
