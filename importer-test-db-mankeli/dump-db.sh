#!/bin/sh
DUMPNAME="importer-test-db-dump.sqz"
docker exec -i importer-test-db pg_dump -Fc -U postgres importer-db > "$DUMPNAME"
