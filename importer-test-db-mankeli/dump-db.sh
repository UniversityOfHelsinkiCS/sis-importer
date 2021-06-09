#!/bin/sh
DUMPNAME="importer-test-db-sample-dump.sqz"
docker-compose up -d importer-test-db
docker exec -i importer-test-db pg_dump -Fc -U postgres importer-test-db-sample > "$DUMPNAME"
