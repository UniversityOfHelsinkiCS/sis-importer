class RequestBuffer {
  constructor() {
    this.data = null
  }

  fill(req) {
    this.data = req()
  }

  read() {
    return this.data
  }

  flush() {
    this.data = null
  }
}

module.exports = new RequestBuffer()
