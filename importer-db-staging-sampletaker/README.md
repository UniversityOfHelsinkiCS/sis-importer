# Creating a sample from the importer-test-db

This folder contains a script that allows you to create a sample from the test importer database. This database has been populated with test data from Sisu.

## Usage

1. First, you will need a copy of the staging importer database. Clone [this repository](https://version.helsinki.fi/toska/openshift/database-cli) if you haven't already, and run `./copy_test_importer_db.sh` in the `database-cli` directory. This script will copy the database and create a dump named `sis-importer-<current date>.sqz`. Move the file into this folder and rename it to `sis-importer.sqz`.

2. If needed, adjust the parameters in `src/index.js`. Please keep in mind that none of the tables should be too large, as the script may run out of memory. A maximum of about 50,000 rows per table can be used as a guideline, which should be more than sufficient for our purposes. You may want to avoid degree programmes with a large number of students. Also, to minimize the number of Oodikone tests that may break, please refrain from changing the selected degree programmes unless absolutely necessary.

3. When satisfied with the parameters, run `./run.sh`.
    - The script will perform a dry run first and report what would remain in the sample database after deletion. You can return to tuning if the results seem unusual.
    - If you adjust the parameters after the dry run, remember to comment out the steps in the script that download, move, and restore the database!
    - **Note:** Running the script will take approximately 15 minutes from start to finish (with a reasonably sized sample).

4. After running the script, the dump will be saved in this folder with the name `sis-importer-db.sqz`.

5. If you are creating new anonymous databases for Oodikone, copy `sis-importer-db.sqz` to the anonyymioodi folder inside Oodikone and follow the instructions in the README there.
