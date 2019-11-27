const { schedule } = require('./utils/cron')
const educationSearchQuery = require('./queries/educationSearch')

const testQuery = async () => {
  const response = await educationSearchQuery({ fullTextQuery: 'Tietojenkäsittely' })
  console.log('response', response)
}

testQuery()

schedule('* * * * * *', async () => {
  console.log('Hello world!', process.env.NODE_ENV)
})
