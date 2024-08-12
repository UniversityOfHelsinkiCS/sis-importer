#!/bin/bash

# Exit on error
set -e

# constants
container="importer-db-staging-copy"
db="sis-importer-db"

# Get dump from pannu to local env or copy inside pannu
get_dump() {
  read -rp "Are you running this locally or in pannu(l/p)?" RUNENV
  pannupath="/home/importer_user/staging/backup/importer-db-staging.sqz"
  if [ "$RUNENV" = "l" ]; then
    # Get db from pannu to current folder
    echo "Enter your Uni Helsinki username:"
    read -r username
    echo "Using your Uni Helsinki username: $username"
  
    scp -r -o ProxyCommand="ssh -l $username -W %h:%p melkki.cs.helsinki.fi" \
    "$username@importer:$pannupath" importer-db-staging.sqz
  elif [ "$RUNENV" = "p" ]; then
    cp $pannupath .
  else
    echo "Wrong option $RUNENV!"
    exit 1
  fi
}

# Setup function
retry () {
    for i in {1..60}; do
        "$@" && break || echo "Retry attempt $i failed, waiting..." && sleep 10;
    done
}
drop_psql () {
    echo "Dropping psql in container $1 with db name $2"
    retry docker exec -u postgres "$1" pg_isready --dbname="$2"
    docker exec -u postgres "$1" dropdb "$2" || echo "container $1 DB $2 does not exist"
}
ping_psql () {
    drop_psql "$1" "$2"
    echo "Creating psql in container $1 with db name $2"
    retry docker exec -u postgres "$1" pg_isready --dbname="$2"
    docker exec -u postgres "$1" createdb "$2" || echo "container $1 DB $2 already exists"
}
restore_psql_from_backup () {
    echo ""
    echo "Restoring database from backup ($1/$2):"
    echo "  1. Copying dump..."
    docker cp "$1" "$2:/asd.sqz"
    echo "  2. Writing database..."
    docker exec "$2" pg_restore -U postgres --no-owner -F c --dbname="$3" -j4 /asd.sqz
}

setup_db () {
  docker compose up -d "$container"
  drop_psql "$container" "$db"
  ping_psql "$container" "$db"
  restore_psql_from_backup importer-db-staging.sqz "$container" "$db"
  # Run analyze to ensure postgres query optimizer has needed info
  docker exec "$container" psql -U postgres "$db" -c 'ANALYZE;'
}

create_sample () {
  # Ensure that newest version of sampletaker is used
  docker compose build importer-db-staging-sampletaker
  
  # Run sampletaker: first dry-run, then confirm
  docker compose run --rm importer-db-staging-sampletaker
  read -rp "Create sample by nuking extra stuff from db(y/n)?" CREATE
  if [ "$CREATE" != "y" ]; then
    exit 0
  fi
  docker compose run --rm -e DESTROY=TRUE importer-db-staging-sampletaker
  
  # Vacuum the sample database
  docker exec "$container" psql -U postgres "$db" -c 'VACUUM FULL;'
  
  # Finally create dump that contains only the new sample
  docker exec -i "$container" pg_dump -Fc -U postgres "$db" > sis-importer-db.sqz
}

cleanup () {
  # Remove original dump
  rm importer-db-staging.sqz
  
  # Run down services
  docker compose down --rmi all --volumes --remove-orphans
}

# run script in phases, comment out phase if need to debug
get_dump
setup_db
create_sample
cleanup
