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

echo "Setting up db"
docker compose down
docker compose up -d $SERVICE

echo "Dropping $DB"
retry docker exec -u postgres $CONTAINER pg_isready --dbname=$DB
docker exec $CONTAINER psql -U dev template1 -c "DROP DATABASE \"$DB\"" || echo "container $CONTAINER DB $DB doesn't exists"

echo "Creating $DB"
retry docker exec -u postgres $CONTAINER pg_isready --dbname=$DB
docker exec $CONTAINER psql -U dev template1 -c "CREATE DATABASE \"$DB\"" || echo "container $CONTAINER DB $DB already exists"

echo "Restoring $DB"
docker exec -i $CONTAINER /bin/bash  -c "gunzip | psql -U dev -d $DB" < $BACKUPS$FILE_NAME 2> /dev/null

echo "Restarting db, db-api and adminer"
./run.sh db up

echo "View adminer here: http://localhost:5051/?pgsql=importer-db&username=dev&db=importer-db&ns=public (password = dev)"
echo "Run ./run.sh up to restart other importer services"
