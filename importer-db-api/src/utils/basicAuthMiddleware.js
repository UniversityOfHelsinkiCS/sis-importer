const { importerDbApiUser, importerDbApiPassword } = require("../config");

const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'Missing authentication' })
    }

    const auth = new Buffer.from(authHeader.split(' ')[1],
        'base64').toString().split(':');
    const user = auth[0];
    const passWord = auth[1];

    if (user == importerDbApiUser && passWord == importerDbApiPassword) {
        next();
    } else {
        res.status(401).json({ error: 'Incorrect credentials' })
    }
}
module.exports = basicAuth
