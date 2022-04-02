const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getPassHash } = require('./users')

require('dotenv').config() // get environment variables

module.exports.generateAccessToken = (cred) => {
    return jwt.sign(cred, process.env.TOKEN_SECRET, { expiresIn: '1h' })
}

module.exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null)
    return res.sendStatus(401) // unauthorized

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) 
        return res.sendStatus(403) // forbidden
    req.user = user
    next()
  })
}

module.exports.adminOnly = (req, res, next) => {
  if (req.user.uid != 0)
    return res.sendStatus(403) // forbidden
  next()
}

module.exports.checkUser = async (email, password) => {
  const passHash = await getPassHash(email)
  if (!passHash) return false
  const match = await bcrypt.compare(password, passHash)
  return match
}