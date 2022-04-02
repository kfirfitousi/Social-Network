const router = require('express').Router()
const { authenticateToken, adminOnly } = require('./utils/auth')
const { getAllUsers, getUser, createUser, updateUser, deleteUser, getRequests, setUserStatus } = require('./utils/users')

router.get('/users', authenticateToken, adminOnly ,async (req, res) => {
    const users = await getAllUsers()
    res.send(JSON.stringify(users, null, 2))
}) 

router.post('/users', async (req, res) => {
    let user

    try {
        user = await createUser(req.body)
    } 
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(201).send(JSON.stringify(user, null, 2)) // created
})

router.get('/users/requests', authenticateToken, adminOnly, async (req, res) => {
    const requests = await getRequests()

    res.status(200).send(JSON.stringify(requests, null, 2))
})

router.post('/users/requests/:uid', authenticateToken, adminOnly, async (req, res) => {
    const uid = parseInt(req.params.uid)
    const { approved } = req.body

    if (typeof(approved) == undefined)
        return res.status(400).send('Missing approved field')

    try {
        approved ? await setUserStatus(uid, 'active') : await deleteUser(uid)
    }
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(200).send(approved ? 'User approved' : 'User deleted')
})

router.get('/users/:uid', authenticateToken, adminOnly, async (req, res) => {
    const uid = parseInt(req.params.uid)
    let user

    try {
        user = await getUser(uid)
    }
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(200).send(JSON.stringify(user, null, 2))
})

router.put('/users/:uid', authenticateToken, async (req, res) => {
    const uid = parseInt(req.params.uid)

    if (!(req.user.uid === 0 || req.user.uid === uid)) // same user or admin only
        return res.sendStatus(403)

    let user

    try { 
        user = await updateUser(uid, req.body)
    }
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(200).send(JSON.stringify(user, null, 2))
})

router.put('/users/:uid/status', authenticateToken, adminOnly, async (req, res) => {
    const uid = parseInt(req.params.uid)
    let user

    try { 
        user = await setUserStatus(uid, req.body.status)
    }
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(200).send(JSON.stringify(user, null, 2))
})

router.delete('/users/:uid', authenticateToken, adminOnly, async (req, res) => {
    const uid = parseInt(req.params.uid)

    try {
        await deleteUser(uid)
    }
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.sendStatus(200)
})

module.exports = router