# SIS-IMPORTER

[Backlog](https://github.com/orgs/UniversityOfHelsinkiCS/projects/19)

## What is importer?

Importer fetches data from Sisu using the export apis. See [example](https://sis-helsinki.funidata.fi/kori/docs/index.html#_export_assessment_items) of export api, importer uses only `since` (modification ordinal) and `limit` parameters. The fetched data is processed in mankelis and saved to PostgreSQL db.

New data from Sisu is fetched once an hour.

[Architecture of importer](./how_tos/importer.png)

For step by step overview of how the importer works, see the following READMEs

- [Fetcher's README](./importer-api/README.md)
- [Mankeli's README](./importer-mankeli/README.md)

## How to connect to the local DB

Connect to db: `docker exec -it sis-importer-db psql -U dev -h importer-db -d importer-db`
Password is `dev`

## Caveats

- Document state: `documentState` field present in all data defines should the data be used or not. Mainly importer ignores any other data than `ACTIVE` (`DRAFT` and `DELETED` in most cases should be ignored).
- Snapshot vs _regular_ data: Snapshot data is described as follows:

  `Start of validity for the snapshot. End of validity is defined by the snapshotDateTime of a possible later snapshot`

  Meaning one needs to find the most recent non-future snapshot date time and active document state to find the correct instance of the given object. For normal data, the same is greatest modification ordinal (=newest version of the object) with active document state.

  With snapshot data in the db is multiple rows (versions) of the object whereas with the regular data there is only present the latest version.

- Manage production and staging environments: use scripts `run_scaled.sh` and `wipe_ordinals.sh` located in the server to manage importer. It is important that mankelis are scaled properly in production.

## Tricks & Tips

- https://importer.cs.helsinkif/exploder/reset/:table?token= deletes a single table and triggers fetch. See tables [here](https://github.com/UniversityOfHelsinkiCS/sis-importer/blob/master/importer-api/src/explorer/index.js#L53) and token from the server.
- https://importer.cs.helsinkif/exploder/force_update?token= triggers a fetch for all tables
- **To add new fields to be fetched from Sisu:** Modify [message handlers](https://github.com/UniversityOfHelsinkiCS/sis-importer/tree/master/importer-mankeli/src/messageHandlers). Remember to add any new columns to models importer-mankeli models.
- **To fetch new model from Sisu:** Create new [message handler](https://github.com/UniversityOfHelsinkiCS/sis-importer/tree/master/importer-mankeli/src/messageHandlers) and [service](https://github.com/UniversityOfHelsinkiCS/sis-importer/tree/master/importer-api/src/services). Finally add new service to [index.js](https://github.com/UniversityOfHelsinkiCS/sis-importer/blob/master/importer-api/src/services/index.js) and test locally that importing works.
- **Debug data coming from specific channel**:
  - First, comment out any other channels in the serviceIds folder in [this](importer-api/src/services/index.js) file.
  - Then, go to [importer-mankeli/src/debug](importer-mankeli/src/debug). Add a custom debug handler into the customHandlers-folder: view the existing custom handlers for how-to.
  - Add your handler to the index.js file in the debug-folder (in the array).
  - Run with "npm start". It will log stuff into console. If you want, make it write the relevant logs to a file for much better experience. (And please push that code to repo too)
  - **Remember** to remove any sensitive identifiers in your matcher before pushing code. Also remove the handler from the array, but you can leave the file in the repository if it may be useful in the future.

## API catalogs

- ORI (student data) https://sis-helsinki.funidata.fi/ori/docs/index.html
- KORI (course data) https://sis-helsinki.funidata.fi/kori/docs/index.html
- ILMO (course enrolments) https://sis-helsinki.funidata.fi/ilmo/docs/index.html
- OSUVA (study plans) https://sis-helsinki.funidata.fi/osuva/docs/index.html
- ARTO (assessments) https://sis-helsinki.funidata.fi/arto/docs/index.html

## Local development

1. See initial setup in https://version.helsinki.fi/toska/dokumentaatio/-/blob/master/guides/how_to_sis-importer_locally.md - contains too much secret data to have here
2. `npm start` will start the application scaled to 3 mankelis.
3.

![catto](http://i.imgur.com/1uYroRF.gif)

### Populate db

Can't wait? Populate db with

```bash
./populate-db.sh
```

The script downloads a daily dump. Go to importer and run the backup script if you need the edgest of the edge.

### Starting specific service groups and ./run.sh

1. To start db, adminer and db-api `./run.sh db up`

Shutting down: `./run.sh down`

Clearing everything: `./run.sh morning`

### Connecting other services (kurki, updater) during local development

Importer uses docker network called `importer_network` - you can get it by running `./run.sh db up`.

Add the following to your non-importer project to include it in the importer network! May require further config with the individual project.

**docker-compose.yaml**

```yaml

---
networks:
  default:
    external:
      name: importer_network
```

Now accessing importer-db will work from the other project. If it's too much work you can change the default network of importer similarly to the other projects. In that case plz do not commit the change here.

### How to skip or reimport already imported data

Importer is idempotent. You can delete data, run it multiple times, whatever, and after you run it it'll always generate the same db.

It keeps the status of individual data in redis (see reset-ordinals). You can connect to the redis instance when it's running with

```console
$ docker exec -it <redis-container> redis-cli
```

By setting the LATEST_XXXX_ORDINAL to 0 (e.g. set LATEST_ENROLMENT_ORDINAL "0") you can refresh data. Or similarly skip data by setting the value _high enough_. Depends on the data what is a good number.

You can use reset-ordinals.sh as the example. It resets all of the ordinals to 0.

### Running tests

Currently only importer-db-api has some tests. If you want to run them locally, you can run these commands:

1. Start the services

    ```bash
    docker compose -f docker-compose.ci.yml -f docker-compose.test.yml up -d
    ```

2. Run the tests

    ```bash
    docker exec -it sis-importer-db-api npm test
    ```

    If you want to run the tests in watch mode, you can add `-- --watchAll` to the end of the command. This will automatically rerun the tests when you make changes to the code and save them.

3. Stop the services

    ```bash
    docker compose -f docker-compose.ci.yml -f docker-compose.test.yml down
    ```

### SONIC mode

If one wants to increase the speed of the importer when developing, set the flag `SONIC` to `1` [here](https://github.com/UniversityOfHelsinkiCS/sis-importer/blob/master/docker-compose.yml#L24)

### Adminer

http://localhost:5051/?pgsql=importer-db&username=dev&db=importer-db&ns=public

### NATS-streaming-console

http://localhost:8282/

## CI

All three services (api, mankeli and db-api) go through individual staging and production github actions workflows, defined in .github/workflows.
Docker images are tagged as `production` and `staging` and are pulled automatically into the production and staging environments.
