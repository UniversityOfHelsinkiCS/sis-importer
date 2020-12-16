# SIS-IMPORTER

### Local development

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

### Starting specific service groups and ./run.sh ###

1. To start db, adminer and db-api `./run.sh db up`

Shutting down: `./run.sh down`

Clearing everything: `./run.sh morning`

### Connecting other services (kurki, updater) during local development ###

Importer uses docker network called `importer_network` - you can get it by running `./run.sh db up`.

Add the following to your non-importer project to include it in the importer network! May require further config with the individual project.

**docker-compose.yaml**
```yaml
...
networks:
  default:
    external: 
      name: importer_network
```

Now accessing importer-db will work from the other project. If it's too much work you can change the default network of importer similarly to the other projects. In that case plz do not commit the change here.

### How to skip or reimport already imported data ###

Importer is idempotent. You can delete data, run it multiple times, whatever, and after you run it it'll always generate the same db.

It keeps the status of individual data in redis (see reset-ordinals). You can connect to the redis instance when it's running with

```console
$ docker exec -it <redis-container> redis-cli
```

By setting the LATEST_XXXX_ORDINAL to 0 (e.g. set LATEST_ENROLMENT_ORDINAL "0") you can refresh data. Or similarly skip data by setting the value *high enough*. Depends on the data what is a good number.

You can use reset-ordinals.sh as the example. It resets all of the ordinals to 0.

### SONIC mode

If one wants to increase the speed of the importer when developing, set the flag `SONIC` to `1` [here](https://github.com/UniversityOfHelsinkiCS/sis-importer/blob/master/docker-compose.yml#L24)

### Adminer

http://localhost:5051/?pgsql=importer-db&username=dev&db=importer-db&ns=public

### NATS-streaming-console ###

http://localhost:8282/  

### Degree structure ###

In dev mode see http://localhost:3002/structure/:code (eg KH50_005 for Computer sciencebachelor) for decree structures.

## CI ##

All three services (api, mankeli and db-api) go through individual github actions workflows, defined in .github/workflows.
Master branch docker images are tagged as `latest` importer automatically pulls new `latest` -images.

Trunk branch is also built with tag `trunk`. But is not currently used.


