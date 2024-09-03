#!/usr/bin/bash

# Exit on error
set -e

# Print messages and logs that are not script output to stderr
msg() {
  echo >&2 -e "${1-}"
}

# Some special types of messages with colours
successmsg() {
  msg "${GREEN}$1${NOFORMAT}\n"
}

errormsg() {
  msg "${RED}$1${NOFORMAT}\n"
}

infomsg() {
  msg "${BLUE}$1${NOFORMAT}\n"
}

warningmsg() {
  msg "${ORANGE}$1${NOFORMAT}\n"
}

# Setup colors for messages if running interactive shell
if [[ -t 2 ]] && [[ "${TERM-}" != "dumb" ]]; then
  NOFORMAT='\033[0m' RED='\033[0;31m' GREEN='\033[0;32m' ORANGE='\033[0;33m' BLUE='\033[0;34m'
else
  NOFORMAT='' RED='' GREEN='' ORANGE='' BLUE=''
fi

retry() {
  sleep 5
  for i in {1..60}; do
    "$@" && break || warningmsg "Retry attempt $i failed, waiting..." && sleep 5
  done
}

database=sis-importer-db
container_name=sis-importer-sampletaker-db
database_dump=sis-importer.sqz

setup_database() {
  if [ ! -f "$database_dump" ]; then
    errormsg "Database dump $database_dump not found in current directory"
    exit 1
  fi

  docker compose up -d "$database" adminer

  infomsg "Attempting to restore database $database from dump $database_dump"
  infomsg "You can open adminer at http://localhost:5051/?pgsql=sis-importer-db&username=postgres&db=sis-importer-db&ns=public to check the database, any password is accepted"

  retry docker compose exec "$database" pg_isready --dbname="$database"

  docker exec -i "$container_name" /bin/bash -c "pg_restore --username=postgres --format=custom --dbname=$database --no-owner --verbose" <"$database_dump"

  docker exec "$container_name" psql -U postgres "$database" -c 'ANALYZE;'
  successmsg "Database $database successfully created"
}

create_sample() {
  docker compose up -d "$database" adminer
  # Ensure that newest version of sampletaker is used
  docker compose build importer-db-staging-sampletaker

  # Run sampletaker: first dry-run, then confirm
  docker compose run --rm importer-db-staging-sampletaker
  read -rp "Create sample by deleting extra rows from db? Confirm with 'yes': " CREATE
  if [ "$CREATE" != "yes" ]; then
    infomsg "Exiting without creating sample"
    exit 0
  fi
  docker compose run --rm -e DESTROY=true importer-db-staging-sampletaker

  # Vacuum the sample database
  infomsg "Vacuuming database $database"
  docker exec "$container_name" psql --username=postgres "$database" -c 'VACUUM FULL;'

  # Finally create dump that contains only the new sample
  infomsg "Creating dump of database $database"
  docker exec -i "$container_name" pg_dump --format=custom --username=postgres "$database" >sis-importer-db.sqz
}

cleanup() {
  read -rp "Remove original dump (y/n)? " DELETE_DUMP
  if [ "$DELETE_DUMP" == "y" ]; then
    infomsg "Removing original dump $database_dump"
    rm "$database_dump"
  fi

  # Run down services
  docker compose down --rmi all --volumes --remove-orphans
}

# Run script in phases, comment out phase if need to debug
setup_database
create_sample
cleanup
