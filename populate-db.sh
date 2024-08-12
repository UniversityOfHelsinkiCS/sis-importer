#!/bin/bash
DIR_PATH=$(dirname "$0")
DB=importer-db
CONTAINER=sis-importer-db
SERVICE=importer-db
BACKUP=$DIR_PATH/backups/importer.sql.gz

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
scp -r -o ProxyCommand="ssh -W %h:%p $username@melkki.cs.helsinki.fi" $username@toska.cs.helsinki.fi:/home/toska_user/most_recent_backup_store/importer.sql.gz $BACKUP

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
docker exec -i $CONTAINER /bin/bash  -c "gunzip | psql -U dev -d $DB" < $BACKUP 2> /dev/null

echo "Restarting db, db-api and adminer"
./run.sh db up

echo "View adminer here: http://localhost:5051/?pgsql=importer-db&username=dev&db=importer-db&ns=public (password = dev)"
echo "Run ./run.sh up to restart other importer services"
