// This was: const { chunk } = require('lodash')

const ONE_MB = 1048576 // also default limit in stan
const SIZE_LIMIT = ONE_MB * 0.9

module.exports = (entities, maxChunkSize) => {
  const chunkified = []
  let currentChunk = []
  let chunkSizeNow = 0

  for (const entity of entities) {
    const wouldBeChunkSize = chunkSizeNow + Buffer.byteLength(JSON.stringify(entity), 'utf8')
    if (currentChunk.length >= maxChunkSize || wouldBeChunkSize >= SIZE_LIMIT) {
      chunkified.push(currentChunk)
      currentChunk = [entity]
      chunkSizeNow = Buffer.byteLength(JSON.stringify(entity), 'utf8')
    } else {
      currentChunk.push(entity)
      chunkSizeNow = wouldBeChunkSize
    }
  }

  chunkified.push(currentChunk)
  return chunkified
}
