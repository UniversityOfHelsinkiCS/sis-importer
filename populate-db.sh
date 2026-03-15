#!/bin/bash
# 
DB=importer-db
CONTAINER=sis-importer-db
SERVICE=importer-db

FOLDER_NAME=sis_importer

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
BACKUPS=$PROJECT_ROOT/backups/

S3_CONF=~/.s3cfg

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 3;
    done
}

if [ ! -f "$S3_CONF" ]; then
  echo ""
  echo "!! No config file for s3 bucket !!"
  echo "Create file for path ~/.s3cfg and copy the credetials from version.helsinki.fi"
  echo ""
  return 0
fi

echo "Creating backups folder"
mkdir -p ${BACKUPS}

echo "Listing available backups in S3 bucket..."
backup_files=$(s3cmd -c "$S3_CONF" ls "s3://psyduck/${FOLDER_NAME}/" | awk '{print $4}' | grep '\.sql\.gz$')

if [ -z "$backup_files" ]; then
  echo "No backup files found in S3 bucket!"
  exit 1
fi

echo "Available backups:"
select chosen_backup in $backup_files; do
  if [ -n "$chosen_backup" ]; then
    echo "You selected: $chosen_backup"
    FILE_NAME=$(basename "$chosen_backup")
    break
  else
    echo "Invalid selection. Please select a valid backup number."
  fi
done

echo "Fetching the selected dump: $FILE_NAME"
s3cmd -c "$S3_CONF" get "$chosen_backup" "$BACKUPS"

if [ ! -f "${BACKUPS}${FILE_NAME}" ]; then
  echo "Download failed or file not found: ${BACKUPS}${FILE_NAME}"
  exit 1
fi

echo "Removing database and related volume"
docker compose down -v

echo "Starting postgres in the background"
docker compose up -d $SERVICE

echo "Waiting for database to be ready..."
retry docker compose exec $SERVICE pg_isready -U dev -d $DB

echo "Populating ${FOLDER_NAME}"
gunzip -c ${BACKUPS}${FILE_NAME} | docker exec -i $CONTAINER psql -U dev -d $DB
