const router = require('express').Router()
const { authenticateToken, adminOnly } = require('./utils/auth')
const { getAllMessages, getMessagesToUser, getMessagesFromUser, createMessage, createMessageToAll } = require('./utils/messages')

router.get('/messages', authenticateToken, adminOnly, async (req, res) => {
    const messages = await getAllMessages()
    res.status(200).send(JSON.stringify(messages, null, 2))
})

router.get('/messages/inbox', authenticateToken, async (req, res) => {
    const messages = await getMessagesToUser(req.user.uid)
    res.status(200).send(JSON.stringify(messages, null, 2))
})

router.get('/messages/outbox', authenticateToken, async (req, res) => {
    const messages = await getMessagesFromUser(req.user.uid)
    res.status(200).send(JSON.stringify(messages, null, 2))
})

router.post('/messages', authenticateToken, async (req, res) => {
    const from = req.user.uid
    const { to, content } = req.body
    let message

    try {
        message = await createMessage(from, to, content)
    } 
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(200).send(JSON.stringify(message, null, 2))
})

router.post('/messages/all', authenticateToken, adminOnly, async (req, res) => {
    let messages

    try {
        messages = await createMessageToAll(req.body.content)
    } 
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(200).send(JSON.stringify(messages, null, 2))
})

module.exports = router