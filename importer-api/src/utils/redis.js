const redis = require('redis')

const client = redis.createClient({
  url: process.env.REDIS_URI
})

const redisPromisify = async (func, ...params) =>
  new Promise((res, rej) => {
    func.call(client, ...params, (err, data) => {
      if (err) rej(err)
      else res(data)
    })
  })

const sadd = async (key, val) => await redisPromisify(client.sadd, key, val)

const smembers = async key => await redisPromisify(client.smembers, key)

const get = async key => await redisPromisify(client.get, key)

const set = async (key, val) => await redisPromisify(client.set, key, val)

const del = async key => await redisPromisify(client.del, key)

const incrby = async (key, val) => await redisPromisify(client.incrby, key, val)

module.exports = {
  sadd,
  smembers,
  get,
  set,
  del,
  incrby
}
