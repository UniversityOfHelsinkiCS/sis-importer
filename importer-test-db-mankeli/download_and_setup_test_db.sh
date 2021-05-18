#!/bin/bash

USER_DATA_FILE_PATH="hyuserdata"

# Remember username during runtime
username=""

get_username() {
  # Check if username has already been set
  [ -z "$username" ]|| return 0

  # Check if username is saved to data file and ask it if not
  if [ ! -f "$USER_DATA_FILE_PATH" ]; then
    echo ""
    echo "!! No previous username data found. Will ask it now !!"
    echo "Enter your Uni Helsinki username:"
    read -r username
    echo "$username" > $USER_DATA_FILE_PATH
    echo "Succesfully saved username"
    echo ""
  fi

  # Set username
  username=$(head -n 1 < $USER_DATA_FILE_PATH)
}

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

run_importer_test_db_setup() {
    get_username
    echo "Using your Uni Helsinki username: $username"

    # Copy db to current folder
    server_dump_filename="importer-test-db.sqz"
    remotepath="/home/importer_user/staging/backup/importer-db-staging.sqz"
    scp -r -o ProxyCommand="ssh -l $username -W %h:%p melkki.cs.helsinki.fi" \
    "$username@importer:$remotepath" "$server_dump_filename"

    # Setup db inside docker
    container_name="importer-test-db"
    database_name="importer-db"

    docker-compose up -d "$container_name"
    ping_psql "$container_name" "$database_name"
    restore_psql_from_backup "$server_dump_filename" "$container_name" "$database_name"
    docker-compose down
}

# Run the script
run_importer_test_db_setup
