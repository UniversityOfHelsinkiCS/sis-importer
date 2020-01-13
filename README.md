# SIS-IMPORTER
### Local development
1. Create `.env` files into `importer-api` and `importer-mankeli` with [contents](https://github.com/UniversityOfHelsinkiCS/dokumentaatio/blob/master/sis/sis-mint.md#env-content) `SIS_API_URL=x` and `PROXY_TOKEN=y`
2. `npm run build`
3. [Start node proxy](https://github.com/UniversityOfHelsinkiCS/node-proxy/blob/master/README.md#installing-and-running) in oodikone-staging
4. `npm start`
5.
![catto](http://i.imgur.com/1uYroRF.gif)

### Shutting down
`npm run dco:down`
