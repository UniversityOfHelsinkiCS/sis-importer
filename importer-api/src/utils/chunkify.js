// This was: const { chunk } = require('lodash')

const ONE_MB = 1048576 // also default limit in stan
const SIZE_LIMIT = ONE_MB * 0.9

module.exports = (entities, maxChunkSize) => {
  let chunkified = []
  let currentChunk = []
  let chunkSizeNow = 0

  for (const entity of entities) {
    if (currentChunk.length >= maxChunkSize || chunkSizeNow >= SIZE_LIMIT) {
      chunkified.push(currentChunk)
      currentChunk = []
      chunkSizeNow = 0
    }

    chunkSizeNow += Buffer.byteLength(JSON.stringify(entity), 'utf8')
    currentChunk.push(entity)
  }

  chunkified.push(currentChunk)
  return chunkified
}
