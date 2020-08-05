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
    return this.httpClient
      .post(
        '/',
        {
          query,
          variables,
        },
        this.getAuthorizedRequestOptions()
      )
      .then(({ data }) => data)
  }
}

module.exports = SisGraphqlClient
