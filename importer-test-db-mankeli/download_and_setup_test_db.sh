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

drop_psql () {
    echo "Dropping psql in container $1 with db name $2"
    retry docker exec -u postgres $1 pg_isready --dbname=$2
    docker exec -u postgres $1 dropdb $2 || echo "container $1 DB $2 does not exist"
}

ping_psql () {
    drop_psql $1 $2
    echo "Creating psql in container $1 with db name $2"
    retry docker exec -u postgres $1 pg_isready --dbname=$2
    docker exec -u postgres $1 createdb $2 || echo "container $1 DB $2 already exists"
}

restore_psql_from_backup () {
    echo ""
    echo "Restoring database from backup ($1/$2):"
    echo "  1. Copying dump..."
    docker cp $1 $2:/asd.sqz
    echo "  2. Writing database..."
    docker exec $2 pg_restore -U postgres --no-owner -F c --dbname=$3 -j4 /asd.sqz
}

run_importer_test_db_setup() {
    get_username
    echo "Using your Uni Helsinki username: $username"

    # Copy db to current folder
    remotepath="/home/importer_user/staging/backup/importer-db-staging.sqz"
    scp -r -o ProxyCommand="ssh -l $username -W %h:%p melkki.cs.helsinki.fi" \
    "$username@importer:$remotepath" .

    # Setup db inside docker
    docker-compose up -d sis-importer-test-db
    ping_psql "sis-importer-test-db" "importer-db"
    restore_psql_from_backup "importer-db-staging.sqz" sis-importer-test-db importer-db
    docker-compose down
}

# Run the script
run_importer_test_db_setup
