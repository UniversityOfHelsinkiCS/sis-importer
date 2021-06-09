# Scripts and stuff to mangel test database for importer and oodikone

This takes sis-test-db from importer staging server and takes out sample of
1000 students. Taken sample can be then used to test importer and oodikone.

Scripts:

- To setup db, run `./download_and_setup_test_db.sh`.
- To start and open psql inside container, run `./psql-db.sh`
- To run mankeli, run `docker-compose up`
-

## How-to: get studentnumbers to use in test database

- Get newest test-db dump from importer-pannus staging folder
- Run updater against test-db dump to create sis-db dump, normally used by oodikone
- Run `./get_student_numbers_from_updater_db.sh` which creates three text files: one for msc, one for bsc and one for other students
- Strip everything else than studentnumbers from these text files, move text files to `src/studentNumbersForTestDump/` folder

## TODO:

- create script for running updater and getting studentnumbers
- write mankeliparser
- add db container for output
- add script to get sqz compressed file from output container
- add script to push sqz compressed test fb to somewhere (server, github?)
