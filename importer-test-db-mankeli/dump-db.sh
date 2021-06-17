#!/bin/sh
DUMPNAME="sis-importer-db.sqz"
docker-compose up -d importer-test-db
docker exec -i importer-test-db pg_dump -Fc -U postgres sis-importer-db > "$DUMPNAME"
