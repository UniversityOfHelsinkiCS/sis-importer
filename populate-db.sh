#!/bin/bash
DIR_PATH=$(dirname "$0")
DB=importer-db
CONTAINER=sis-importer-db
SERVICE=importer-db
BACKUP=$DIR_PATH/backups/importer-db.sqz

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 10;
    done
}

mkdir -p backups

echo "Enter your Uni Helsinki username:"
read username
echo "Fetching backup data"
scp -r -o ProxyCommand="ssh -W %h:%p $username@melkinpaasi.cs.helsinki.fi" $username@importer.cs.helsinki.fi:/home/importer_user/importer-db/backup/importer-db.sqz $BACKUP

echo "Setting up db"
docker-compose down
docker-compose up -d $SERVICE

echo "Dropping $DB"
retry docker exec -u postgres $CONTAINER pg_isready --dbname=$DB
docker exec -u postgres $CONTAINER psql -c "DROP DATABASE \"$DB\"" || echo "container $CONTAINER DB $DB doesn't exists"

echo "Creating $DB"
retry docker exec -u postgres $CONTAINER pg_isready --dbname=$DB
docker exec -u postgres $CONTAINER psql -c "CREATE DATABASE \"$DB\"" || echo "container $CONTAINER DB $DB already exists"

echo "Copying $DB to the container"
docker cp $BACKUP $CONTAINER:/asd.sqz

echo "Running pg_restore $DB inside the container. Run \"docker stats\" to see processing."
docker exec $CONTAINER pg_restore -U postgres --no-owner -F c --dbname="$DB" -j4 /asd.sqz

echo "Restarting db, db-api and adminer"
./run.sh db up

echo "View adminer here: http://localhost:5051/?pgsql=importer-db&username=dev&db=importer-db&ns=public (password = dev)"
echo "Run ./run.sh up to restart other importer services"
