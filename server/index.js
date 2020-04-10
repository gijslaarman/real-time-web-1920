const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const colors = require('./colors.json')

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let connectedUsers = []

class Chatter {
    constructor(nickname, id) {
        this.nickname = nickname
        this.UUID = id
        this.color = this.generateColor()
        this.attributes = {}
    }

    generateColor() {
        const colorAmount = colors.length // 20
        const randomNumber = Math.floor(Math.random() * Math.floor(colorAmount))
        return colors[randomNumber]
    }

    get name() {
        return this.nickname
    }
}

io.on('connection', socket => {
    socket.on('new user', nickname => {
        const person = new Chatter(nickname, socket.id)
        connectedUsers.push({ UUID: socket.id, person })
        console.log(connectedUsers[0])
        socket.broadcast.emit('message', { type: 'notification', text: `${nickname} just joined!` })
        socket.broadcast.emit('new user', person)
        socket.emit('load event', connectedUsers)
    })

    socket.on('chat message', msg => {
        console.log(msg)
        const nickname = connectedUsers.find(user => user.UUID === socket.id).person.nickname
        console.log(nickname)
        io.emit('message', { type: 'message', text: msg, uuid: socket.id, nickname: nickname })
    })

    socket.on('disconnect', () => {
        const index = connectedUsers.findIndex(user => user.UUID === socket.id)
        if (index > -1) {
            const leftUser = connectedUsers[index].person
            console.log(leftUser.nickname + ` disconnected.`)
            socket.broadcast.emit('message', { type: 'notification', text: `${leftUser.nickname} left.` })
            socket.broadcast.emit('user left', leftUser)
            connectedUsers.splice(index, 1)
        }

        console.log(`Connected users left: ${connectedUsers}`)
        // io.emit('disconnected user')
    })
})

http.listen(9000, () => {
    console.log('listening on *:9000')
})