#!/bin/sh
docker-compose up -d
docker exec -it importer-test-db psql -U postgres importer-db
