# SIS-IMPORTER

https://version.helsinki.fi/toska/dokumentaatio/-/blob/master/guides/how_to_sis-importer_locally.md

### Local development
1. Create `.env` files into `importer-api`, `importer-db-api` and `importer-mankeli` with [contents](https://github.com/UniversityOfHelsinkiCS/dokumentaatio/blob/master/sis/sis-mint.md#env-content) `SIS_API_URL=x` and `PROXY_TOKEN=y`
2. `npm run build`
3. [Start node proxy](https://github.com/UniversityOfHelsinkiCS/node-proxy/blob/master/README.md#installing-and-running) in oodikone-staging
4. `npm start`
5.
![catto](http://i.imgur.com/1uYroRF.gif)

### Populate db
```bash
./populate-db.sh
```

### Starting specific service groups ###

1. To inspect the db with adminer `npm run start:db`
2. To develop the db-api with db and adminer `npm run start:api`

### SONIC mode
If one wants to increase the speed of the importer when developing, set the flag `SONIC` to `1` [here](https://github.com/UniversityOfHelsinkiCS/sis-importer/blob/master/docker/docker-compose.dev.yml#L13)

### Adminer
http://localhost:5051/?pgsql=importer-db&username=dev&db=importer-db&ns=public

### NATS-streaming-console
http://localhost:8282/  

### Shutting down
`npm run dco:down`

### Degree structure

In dev mode see http://localhost:3002/structure/:code (eg KH50_005 for Computer sciencebachelor) for decree structures.

## CI

All three services (api, mankeli and db-api) go through individual github actions workflows, defined in .github/workflows.
Master branch docker images are tagged as `latest`, trunk branch as `trunk`. oodikone-staging automatically pulls new `latest` -images.

### TODO
Make a release pipeline when this goes to production.

