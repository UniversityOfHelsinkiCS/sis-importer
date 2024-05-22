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
      params: { ...(this.token && { token: this.token }), ...params }
    }
  }

  query(query, variables = {}) {
    const path = ''
    const payload = {
      query,
      variables
    }
    const options = this.getAuthorizedRequestOptions()

    return this.httpClient.post(path, payload, options).then(({ data }) => data)
  }
}

module.exports = SisGraphqlClient
