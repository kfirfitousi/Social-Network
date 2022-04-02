const fs = require('fs/promises')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const HttpErr = require('./HttpErr')

const getData = async () => {
    const data = await fs.readFile('data/users.json')
    const parsedData = await JSON.parse(data)
    return parsedData
}

const saveData = async (data) => {
    await fs.writeFile('data/users.json', JSON.stringify(data, null, 2))
}

module.exports.getAllUsers = async () => {
    const users = await getData()
    users.forEach(user => delete user._password)
    return users
}

module.exports.getUser = async (uid) => {
    if (uid < 0)
       throw new HttpErr('User doesn\'t exist', 404)
    
    const users = await getData()
    const user = users.find(user => user.id == uid)
    
    if (!user) 
       throw new HttpErr('User doesn\'t exist', 404)    
    
    delete user._password
    return user
}

module.exports.getPassHash = async (email) => {
    const users = await getData()
    const user = users.find(user => user.email.toLowerCase() == email.toLowerCase())
    return user?._password
}

module.exports.getUserId = async (email) => {
    const users = await getData()
    const user = users.find(user => user.email.toLowerCase() == email.toLowerCase())
    return user?.id
}

module.exports.getUserName = async (email) => {
    const users = await getData()
    const user = users.find(user => user.email.toLowerCase() == email.toLowerCase())
    return user?.name
}

module.exports.setUserStatus = async (uid, newStatus) => {
    if (uid == 0) // admin user
       throw new HttpErr('Can\'t change this user', 405) // method not allowed
    if (uid < 0)
        throw new HttpErr('User doesn\'t exist', 404)
    if (!['active', 'suspended'].includes(newStatus))
        throw new HttpErr('Invalid status. Must be either \'active\' or \'suspended\'', 400)

    const users = await getData()
    const idx = users.findIndex(user => user.id == uid)
    
    if (idx < 0)
        throw new HttpErr('User doesn\'t exist', 404)
    
    users[idx].status = newStatus
    
    await saveData(users)

    delete users[idx]._password
    return users[idx]
}

module.exports.createUser = async (params) => {
    const { name, email, password } = params
    
    if (!name) throw new HttpErr('Missing name', 400)
    if (!email) throw new HttpErr('Missing email', 400)
    if (!email.includes('@','.')) throw new HttpErr('Invalid email', 400)
    if (!password) throw new HttpErr('Missing password', 400)

    const users = await getData()
    
    const exists = await this.userExistsByEmail(email)
    if (exists)
        throw new HttpErr('Email already in use', 409) // conflict

    let passHash
    await bcrypt.hash(password, saltRounds).then(hash => passHash = hash)

    let maxId = 0
    users.forEach(user => maxId = Math.max(maxId, user.id))

    const newUser = {
        id: maxId+1,
        name: name,
        email: email,
        _password: passHash,
        created: new Date(), 
        status: 'created', 
    } 

    const updatedUsers = [...users, newUser]
    await saveData(updatedUsers)
    
    delete newUser._password
    return newUser
}

module.exports.updateUser = async (uid, props) => {
    if (uid == 0) // admin user
       throw new HttpErr('Can\'t change this user', 405) // method not allowed
    if (uid < 0)
       throw new HttpErr('User doesn\'t exist', 404)
    if (props.email) {
        const exists = await this.userExistsByEmail(props.email)
        if (exists) 
            throw new HttpErr('Email already in use', 409) // conflict
    }

    const users = await getData()
    const idx = users.findIndex(user => user.id == uid)
    
    if (idx < 0) 
       throw new HttpErr('User doesn\'t exist', 404)

    if (props.email)
       users[idx].email = props.email
    if (props.name)
       users[idx].name = props.name
       
    await saveData(users)

    delete users[idx]._password
    return users[idx]
}

module.exports.deleteUser = async (uid) => {
    if (uid == 0) // admin user
        throw new HttpErr('Can\'t delete this user', 405) // method not allowed
    if (uid < 0)
        throw new HttpErr('User doesn\'t exist', 404)

    const users = await getData()
    const idx = users.findIndex(user => user.id == uid)
    
    if (idx < 0)
        throw new HttpErr('User doesn\'t exist', 404)
    
    const filteredUsers = [...users.slice(0, idx), ...users.slice(idx+1)]

    await saveData(filteredUsers)
}

module.exports.userExistsById = async (uid) => {
    if (uid < 0) 
        return false

    const users = await getData()
    return users.some(user => user.id == uid)
}

module.exports.userExistsByEmail = async (email) => {
    if (!email.includes('@','.'))
        return false
    
    const users = await getData()
    return users.some(user => user.email.toLowerCase() == email.toLowerCase())
}

module.exports.getRequests = async () => {
    const users = await getData()
    const userRequests = users.filter(user => user.status == 'created')

    userRequests.forEach(user => delete user._password)

    return userRequests
}