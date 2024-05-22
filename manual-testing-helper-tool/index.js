const { apiHealthCheck, axiosInstance, wait } = require('./lib')

const SLOW = false
const START_ORDINAL = 0
const MAX_ORDINAL = 248_676_623
const CHUNK_SIZE = 10000

const testPath = 'kori/api/course-units/v1/export'

const reportProgress = (rates, latestOrdinal) => {
  let avgRate = 0
  let count = 0
  for (let i = 0; i < 3; i++) {
    const acualIndex = rates.length - i - 1
    if (acualIndex < 0) break
    const rate = rates[acualIndex]
    avgRate += rate
    count++
  }
  avgRate /= count
  console.log(latestOrdinal, `ETA ${(MAX_ORDINAL - latestOrdinal) / avgRate} s`)
}

const loopEntities = entity => {
  // if (entity.metadata.modificationOrdinal !== 0000) return false
  if (entity.id == 'hy-CU-135279835-2021-08-01' || entity.code == 'DENT-206' || entity.groupId == 'hy-CU-135279835') {
    return true
  }
  return false
}

const main = async () => {
  await apiHealthCheck()
  let currentOrdinal = START_ORDINAL
  let hasMore = true
  let limit = CHUNK_SIZE

  let entities = []
  let dataIWasLookingFor = []

  const rates = []
  let batchStart = Date.now()

  while (hasMore && currentOrdinal <= MAX_ORDINAL) {
    reportProgress(rates, currentOrdinal)

    const resPromise = axiosInstance.get(testPath, {
      params: {
        since: currentOrdinal,
        limit
      }
    })

    const newEntities = entities.filter(loopEntities)
    if (newEntities.length) {
      dataIWasLookingFor = dataIWasLookingFor.concat(newEntities)
      // console.log(dataIWasLookingFor)
    }

    const data = (await resPromise).data
    hasMore = data.hasMore

    const ordinalDelta = data.greatestOrdinal - currentOrdinal
    const timeDelta = Date.now() - batchStart
    batchStart = Date.now()
    rates.push(ordinalDelta / (timeDelta / 1000))

    currentOrdinal = data.greatestOrdinal
    entities = data.entities

    if (SLOW) await wait(1000)
  }
  const newEntities = entities.filter(loopEntities)
  if (newEntities.length) {
    dataIWasLookingFor = dataIWasLookingFor.concat(newEntities)
    console.log(dataIWasLookingFor)
  }

  console.log('HELPER HAS ENDEDz. FINAL DATA HERE')

  console.log(JSON.stringify(dataIWasLookingFor, null, 2))
}

main()
