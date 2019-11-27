const { schedule } = require('./utils/cron')

schedule('* * * * * *', () => {
  console.log('Hello world!', process.env.NODE_ENV)
})
