const  { apiHealthCheck, axiosInstance, wait } = require('./lib')

const SLOW = false
const START_ORDINAL = 0
const CHUNK_SIZE = 10000

const testPath = "ori/api/study-rights/v1/export";

const loopEntities = (entity) => {
  if (entity.studentId !== 'XXXXXX') return false

  return true
}

const main = async () => {
  await apiHealthCheck();
  let currentOrdinal = START_ORDINAL;
  let hasMore = true;
  let limit = CHUNK_SIZE;

  let entities = []
  let dataIWasLookingFor = []

  while (hasMore) {
    console.log(currentOrdinal);

    const resPromise = axiosInstance.get(testPath, {
      params: {
        since: currentOrdinal,
        limit,
      },
    });

    const newEntities = entities.filter(loopEntities)
    if (newEntities.length) {
      dataIWasLookingFor = dataIWasLookingFor.concat(newEntities)
      console.log(dataIWasLookingFor)
    }

    const data = (await resPromise).data
    hasMore = data.hasMore;
    currentOrdinal = data.greatestOrdinal;
    entities = data.entities

    if (SLOW) await wait(1000);
  }
  console.log(dataIWasLookingFor)
};

main();
