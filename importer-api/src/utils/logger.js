const os = require('os')

const winston = require('winston')
const LokiTransport = require('winston-loki')
const { WinstonGelfTransporter } = require('winston-gelf-transporter')

const { IS_DEV, SERVICE_PROVIDER } = require('../config')
const { combine, timestamp, printf, splat } = winston.format

const transports = []

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.File({ filename: 'debug.log' }))
}

if (IS_DEV) {
  const devFormat = printf(({ level, message, timestamp, ...rest }) => {
    return `${timestamp} ${level}: ${message} ${JSON.stringify(rest)}`
  })

  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: combine(splat(), timestamp(), devFormat)
    })
  )
}

if (!IS_DEV) {
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  }

  const prodFormat = winston.format.printf(({ level, ...rest }) => {
    if (SERVICE_PROVIDER !== 'fd') {
      return JSON.stringify({
        level: levels[level],
        ...rest
      })
    } else {
      return JSON.stringify({
        funidata: 'Mock message'
      })
    }
  })

  transports.push(new winston.transports.Console({ format: prodFormat }))

  transports.push(
    new LokiTransport({
      host: 'http://loki-svc.toska-lokki.svc.cluster.local:3100',
      labels: { app: 'sis-importer', environment: process.env.NODE_ENV || 'production' }
    })
  )

  if (!process.env.STAGING && SERVICE_PROVIDER !== 'fd') {
    transports.push(
      new WinstonGelfTransporter({
        handleExceptions: true,
        host: 'svm-116.cs.helsinki.fi',
        port: 9503,
        protocol: 'udp',
        hostName: os.hostname(),
        additional: {
          app: 'importer-api',
          environment: 'production'
        }
      })
    )
  }
}

const logger = winston.createLogger({ transports })

module.exports = {
  logger
}
