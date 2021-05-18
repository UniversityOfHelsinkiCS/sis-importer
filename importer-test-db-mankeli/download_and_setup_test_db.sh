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

run_importer_test_db_setup() {
    get_username
    echo "Using your Uni Helsinki username: $username"

    # Copy db to current folder
    remotepath="/home/importer_user/staging/backup/importer-db-staging.sqz"
    scp -r -o ProxyCommand="ssh -l $username -W %h:%p melkki.cs.helsinki.fi" \
    "$username@importer:$remotepath" .
}

# Run the script
run_importer_test_db_setup
