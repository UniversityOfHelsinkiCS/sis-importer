#!/bin/bash
DIR_PATH=$(dirname "$0")
DB=importer-db
CONTAINER=sis-importer-db
SERVICE=importer-db
BACKUP=$DIR_PATH/backups/sis-importer-staging.sqz

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 10;
    done
}

mkdir -p backups

echo "Fetching latest staging backup data"
scp -r -o ProxyCommand="ssh -W %h:%p melkinpaasi.cs.helsinki.fi" oodikone-staging:/home/tkt_oodi/backups/sis-importer-staging.sqz $BACKUP

echo "Setting up db"
npm run dco:setup_network
npm run dco:down --prefix $DIR_PATH
npm run dco:up --prefix $DIR_PATH -- $SERVICE

echo "Dropping $DB"
retry docker exec -u postgres $CONTAINER pg_isready --dbname=$DB
docker exec -u postgres $CONTAINER psql -c "DROP DATABASE \"$DB\"" || echo "container $CONTAINER DB $DB doesn't exists"

echo "Creating $DB"
retry docker exec -u postgres $CONTAINER pg_isready --dbname=$DB
docker exec -u postgres $CONTAINER psql -c "CREATE DATABASE \"$DB\"" || echo "container $CONTAINER DB $DB already exists"

echo "Populating $DB"
docker cp $BACKUP $CONTAINER:/asd.sqz
docker exec $CONTAINER pg_restore -U postgres --no-owner -F c --dbname="$DB" -j4 /asd.sqz

echo "Restarting db and adminer"
npm run dco:up:db --prefix $DIR_PATH

echo "View adminer here: http://localhost:5051/?pgsql=importer-db&username=dev&db=importer-db&ns=public (password = dev)"
echo "Run npm start to restart other services"
