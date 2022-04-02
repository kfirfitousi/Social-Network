const router = require('express').Router()

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

router.get('/about', (req, res) => {
    res.sendFile(__dirname + '/public/about.html')
})

router.get('/messages', (req, res) => {
    res.sendFile(__dirname + '/public/messages.html')
})

router.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

router.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html')
})

module.exports = router