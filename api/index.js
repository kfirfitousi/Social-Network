const router = require('express').Router()
const auth = require('./auth')
const users = require('./users')
const posts = require('./posts')
const messages = require('./messages')

const { version } = require('../package.json')

router.get('/version', (req, res) => {
    res.status(200).send(JSON.stringify(version))
})

module.exports = [ router, auth, users, posts, messages ]