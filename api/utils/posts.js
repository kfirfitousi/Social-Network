const fs = require("fs/promises")
const { userExistsById, getUser } = require('./users')
const HttpErr = require('./HttpErr')

const getData = async () => {
    const data = await fs.readFile('data/posts.json')
    const parsedData = await JSON.parse(data)
    return parsedData
}

const saveData = async (data) => {
    await fs.writeFile('data/posts.json', JSON.stringify(data, null, 2))
}

module.exports.getAllPosts = async () => {
    const posts = await getData()
    return posts
}

module.exports.getUserPosts = async (uid) => {
    const exists = await userExistsById(uid)

    if (!exists)
        throw new HttpErr('User doesn\'t exist', 404)

    const posts = await getData()
    const filteredPosts = posts.filter(post => post.uid == uid) 
    
    return filteredPosts
}

module.exports.getPost = async (uid, pid) => {
    const exists = await userExistsById(uid)

    if (!exists)
        throw new HttpErr('User doesn\'t exist', 404)

    const posts = await getData()
    const idx = posts.findIndex(post => post.pid == pid && post.uid == uid)

    if (idx < 0)
        throw new HttpErr('Post doesn\'t exist', 404)

    return posts[idx]
}

module.exports.createPost = async (uid, content) => {
    if (!content)
        throw new HttpErr('Missing post content', 400) // bad request
    if (uid < 0)
       throw new HttpErr('User doesn\'t exist', 404)

    const user = await getUser(uid)
    if (user.status != 'active')
        throw new HttpErr('User is not active', 403) // forbidden

    const posts = await getData()
    let maxId = 0
    let maxPid = 0

    posts.forEach(post => {
        maxId = Math.max(maxId, post.id)
        if (post.uid == uid) 
            maxPid = Math.max(maxPid, post.pid)
    })

    const newPost = {
        id: maxId+1,
        uid: uid,
        pid: maxPid+1,
        username: user.name,
        content: content,
        created: new Date()
    }

    const updatedPosts = [...posts, newPost]
    await saveData(updatedPosts)
    
    return newPost
}

module.exports.deletePost = async (uid, pid) => {
    const exists = await userExistsById(uid)

    if (!exists)
        throw new HttpErr('User doesn\'t exist', 404)
    
    const posts = await getData()
    const idx = posts.findIndex(post => post.pid == pid && post.uid == uid)
    
    if (idx < 0)
        throw new HttpErr('Post doesn\'t exist', 404)
    
    const filteredPosts = [...posts.slice(0, idx), ...posts.slice(idx+1)]

    await saveData(filteredPosts)
}