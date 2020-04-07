const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let connectedUsers = []

io.on('connection', socket => {
    socket.on('new user', nickname => {
        connectedUsers.push({ nickname, uuid: socket.id })
        console.log(nickname + ' connected!')
        socket.broadcast.emit('message', { type: 'notification', text: `${nickname} just joined!` })
    })

    socket.on('chat message', msg => {
        console.log(msg)
        const nickname = connectedUsers.find(user => user.uuid === socket.id).nickname
        io.emit('message', { type: 'message', text: msg, uuid: socket.id, nickname })
    })

    socket.on('disconnect', () => {
        const index = connectedUsers.findIndex(user => user.uuid === socket.id)
        
        if (index > -1) {
            console.log(connectedUsers[index].nickname + ` disconnected.`)
            socket.broadcast.emit('message', { type: 'notification', text: `${connectedUsers[index].nickname} left.` })
            connectedUsers.splice(index, 1)
        }
        // io.emit('disconnected user')
    })
})

http.listen(3000, () => {
    console.log('listening on *:3000')
})