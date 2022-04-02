const fs = require("fs/promises")
const HttpErr = require('./HttpErr')
const { getAllUsers, userExistsById, getUser } = require("./users")

const getData = async () => {
    const data = await fs.readFile('data/messages.json')
    const parsedData = await JSON.parse(data)
    return parsedData
}

const saveData = async (data) => {
    await fs.writeFile('data/messages.json', JSON.stringify(data, null, 2))
}

module.exports.getAllMessages = async () => {
    const messages = await getData()
    return messages
}

module.exports.getMessagesToUser = async (uid) => {
    const exists = await userExistsById(uid)

    if (!exists)
        throw new HttpErr('User doesn\'t exist', 404)

    const messages = await getData()
    const filteredMessages = messages.filter(msg => msg.to == uid)

    return filteredMessages
}

module.exports.getMessagesFromUser = async (uid) => {
    const exists = await userExistsById(uid)

    if (!exists)
        throw new HttpErr('User doesn\'t exist', 404)

    const messages = await getData()
    const filteredMessages = messages.filter(msg => msg.from == uid)

    return filteredMessages
}

module.exports.createMessage = async (from, to, content) => {
    if (from === undefined)
        throw new HttpErr('Missing message creator', 400)
    if (to === undefined)
        throw new HttpErr('Missing message recipient', 400)
    if (!content)
        throw new HttpErr('Missing message content', 400)
    
    const user = await getUser(from)
    if (user.status != 'active')
        throw new HttpErr('User is not active', 403) // forbidden

    await getUser(to) // check if recipient exists
    
    const messages = await getData()
    
    let maxId = 1
    messages.forEach(msg => maxId = Math.max(maxId, msg.id))

    const newMessage = {
        id: maxId+1,
        from: from,
        fromName: user.name,
        to: to,
        content: content,
        created: new Date()
    }

    const updatedMessages = [...messages, newMessage]
    await saveData(updatedMessages)

    return newMessage
}

module.exports.createMessageToAll = async (content) => {
    if (!content)
        throw new HttpErr('Missing message content', 400)
    
    const messages = await getData()
    const users = await getAllUsers()
    
    let maxId = 1
    messages.forEach(msg => maxId = Math.max(maxId, msg.id))

    const now = new Date()

    const newMessages = users.filter(user => user.id != 0).map(user => {
        return {
            id: ++maxId,
            from: 0,
            fromName: 'admin',
            to: user.id,
            content: content,
            created: now
        }
    })

    const updatedMessages = [...messages, ...newMessages]
    await saveData(updatedMessages)
    
    return newMessages
}