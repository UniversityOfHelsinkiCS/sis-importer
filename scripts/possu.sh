#!/bin/bash
docker exec -it sis-importer-db psql "postgresql://dev:dev@importer-db:5432/importer-db"