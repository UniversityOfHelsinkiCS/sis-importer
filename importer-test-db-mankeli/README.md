# Scripts and stuff to mangel test database for importer and oodikone

This takes sis-test-db from importer staging server and takes out sample of
1000 students. Taken sample can be then used to test importer and oodikone.

Scripts:

- To setup db, run `./download_and_setup_test_db.sh`.
- To start and open psql inside container, run `./psql-db.sh`
- To run mankeli, run `docker-compose up importer-test-db-mankeli`
