# Take sample from importer-db-staging

Folder contains script that allows you to create sample from anonymized SIS db. You can run script either locally or at importerpannu.

## How-to:
- Ensure there's backup available at `staging/backup` -folder in importerpannu. You can make backup with script in importerpannus `staging` -folder.
- Tune parameters (sample size, educations to include etc.) in `src/index.js`.
- When happy, run `./run.sh`.
  - Script will do dry-run first and reports what would be left in sample database after deletion. You can return back to tuning if results look weird.
  - If you're tuning parameters after dry-run, remember to comment out database downloading, moving and restoring steps from the script!
  - Note: Running the script will take time, maybe even couple of hours. 
- After running the script, dump will be in this folder with name `sis-importer-db.sqz`.
  - In case you're creating new anon databases for oodikone, copy dump to [anonyymioodi -repo](https://github.com/UniversityOfHelsinkiCS/anonyymioodi/) and continue to creating sis-db with oodikone's updater.
