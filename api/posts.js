const router = require('express').Router()
const { getUserPosts, getPost, getAllPosts, createPost, deletePost } = require('./utils/posts')
const { authenticateToken } = require('./utils/auth')

router.get('/posts', authenticateToken, async (req, res) => {
    const posts = await getAllPosts()
    res.status(200).send(JSON.stringify(posts, null, 2))
})

router.post('/posts', authenticateToken, async (req, res) => {
    let post

    try {
        post = await createPost(req.user.uid, req.body.content)
    } 
    catch (err) {
        return res.status(err.code).send(err.message)
    }

    res.status(201).send(JSON.stringify(post, null, 2))
})

router.get('/users/:uid/posts', authenticateToken, async (req, res) => {
    const uid = parseInt(req.params.uid)
    let posts

    try {
        posts = await getUserPosts(uid)
    } 
    catch (err) {
        return res.status(err.code).send(err.message)
    }
    
    res.status(200).send(JSON.stringify(posts, null, 2))
})

router.get('/users/:uid/posts/:pid', authenticateToken, async (req, res) => {
    const uid = parseInt(req.params.uid)
    const pid = parseInt(req.params.pid)
    let post
    
    try {
        post = await getPost(uid, pid)
    } 
    catch (err) {
        return res.status(err.code).send(err.message)
    }
    
    res.status(200).send(JSON.stringify(post, null, 2))
})

router.delete('/users/:uid/posts/:pid', authenticateToken, async (req, res) => {
    const uid = parseInt(req.params.uid)
    const pid = parseInt(req.params.pid)
    
    if (!(req.user.uid == 0 || req.user.uid == uid)) // only creator and admin can delete
        return res.sendStatus(403)

    try {
        await deletePost(uid, pid)
    } 
    catch (err) {
        return res.status(err.code).send(err.message)
    }
    
    res.sendStatus(200)
})

module.exports = router