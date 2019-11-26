const { schedule } = require('./utils/cron')

schedule('* * * * * *', () => {
  console.log('Hello world!')
})
