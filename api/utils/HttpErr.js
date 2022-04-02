class HttpErr {
    constructor(message, code) {
        this.name = 'HTTP Error'
        this.message = message || 'Error occured'
        this.code = code
    }
}
    
HttpErr.prototype = Object.create(Error.prototype)
module.exports = HttpErr