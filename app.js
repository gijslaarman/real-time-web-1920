require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const generateTwitterHandle = require('username-generator')
const port = process.env.PORT || 3000

const rooms = [{
    pin: 'abcde',
    persons: 2,
    name: null
}]

// Folder for static assets, imgs, scripts & styling.
app.use(express.static('static'))

// No routes needed, IO will control all traffic & clients will handle the rendering.
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/room-check', (req, res) => {
    // Returning a boolean based on if the room exists. So client side won't be able to figure out what rooms exists.
    // With the boolean the client side knows if to join a room or send an error message.
    const index = rooms.findIndex(room => room.pin == req.query.pin)

    if (index < 0) {
        res.send(false)
    } else {
        res.send(true)
    }
})

// IO CONNECTION HANDLING.
io.on('connection', socket => {
    console.log(`${socket.id} just connected!`)

    socket.on('join room', roomPin => {

    })

    socket.on('create new room', () => {
        console.log(socket.id + ' created a new room!')
    })

})

http.listen(port, () => {
    console.log(`Listening on: ${port}`)
})