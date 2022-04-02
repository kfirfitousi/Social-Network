const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { generateAccessToken, checkUser } = require('./utils/auth')
const { getUserId, getUserName } = require('./utils/users')

require('dotenv').config() // get environment variables

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).send('Missing credentials')

    const valid = await checkUser(email, password)

    if (!valid)
        return res.status(401).send('Bad credentials')
    
    const uid = await getUserId(email)
    const name = await getUserName(email)
    const token = generateAccessToken({ 
        uid, 
        name, 
        email, 
        isAdmin: uid == 0 
    })
    
    res.status(200).send({token})
})

router.post('/auth/verify', async (req, res) => {
    const { token } = req.body

    if (!token)
        return res.status(400).send('Missing token')
        
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) 
            return res.status(401).send('Bad token')
        
        res.status(200).send({ 
            uid: user.uid, 
            name: user.name,
            email: user.email, 
            isAdmin: user.isAdmin 
        })
    })
})

module.exports = router