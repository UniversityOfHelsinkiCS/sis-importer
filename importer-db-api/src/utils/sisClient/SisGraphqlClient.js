class SisGraphqlClient {
  constructor({ httpClient, token }) {
    this.httpClient = httpClient
    this.token = token
  }

  getAuthorizedRequestOptions(options) {
    const normalizedOptions = options ? options : {}

    const { params } = normalizedOptions

    return {
      ...normalizedOptions,
      params: { ...(this.token && { token: this.token }), ...params },
    }
  }

  query(query, variables = {}) {
    const path = '/'
    const payload = {
      query,
      variables,
    }
    const options = this.getAuthorizedRequestOptions()

    const cert = this.httpClient.defaults.httpsAgent.options.cert
    const key = this.httpClient.defaults.httpsAgent.options.key

    console.log('Doing a query with httpClient and...')
    console.log('cert', cert.substr(0,20))
    console.log('key', key.substr(0,20))
    console.log(path)
    console.log(payload)
    console.log(options)
    console.log('---------------------')

    return this.httpClient.post(path, payload, options).then(({ data }) => data)
  }
}

module.exports = SisGraphqlClient
