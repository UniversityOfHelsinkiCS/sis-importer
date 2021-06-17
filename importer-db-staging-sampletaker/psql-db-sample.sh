#!/bin/sh
docker-compose up -d importer-test-db
docker exec -it importer-test-db psql -U postgres sis-importer-db
