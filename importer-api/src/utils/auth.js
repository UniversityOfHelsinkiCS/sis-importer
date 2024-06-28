const { API_KEY, PROXY_TOKEN, SIS_API_USER, SIS_API_PASSWORD, KEY_PATH, CERT_PATH } = process.env

const hasCerts = KEY_PATH && CERT_PATH

const getSisBasicAuthHeader = () => {
  const auth = `${SIS_API_USER}:${SIS_API_PASSWORD}`
  const token = Buffer.from(auth).toString('base64')
  return {
    Authorization: 'Basic ' + token
  }
}

const getAuthHeaders = () => {
  const basicAuthProvided = SIS_API_USER && SIS_API_PASSWORD
  if (basicAuthProvided) {
    return getSisBasicAuthHeader()
  }

  if (!hasCerts) return { token: PROXY_TOKEN }
  if (hasCerts && API_KEY) return { 'X-Api-Key': API_KEY }

  return {}
}

module.exports = {
  getAuthHeaders
}
