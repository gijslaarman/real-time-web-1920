require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const generateTwitterHandle = require('username-generator')
const generatePin = require('./script/generatePin.js')
const Room = require('./script/Room.js')
const port = process.env.PORT || 3000

const rooms = []

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
    socket.on('join room', values => {
        const index = rooms.findIndex(room => room.pin === values.roomPin)
        rooms[index].addPlayer({ UUID: socket.id, username: values.username, handle: generateTwitterHandle.generateUsername() })

        socket.join(values.roomPin)
        console.log(rooms)
    })

    socket.on('create new room', values => {
        const generatedPin = generatePin(5)
        // if (rooms.indexOf(room => room.pin == generatedPin)) // generate new pin.
        rooms.push(new Room(generatedPin, { UUID: socket.id, username: values.username, handle: generateTwitterHandle.generateUsername() }))
        socket.join(generatedPin)
        io.to(generatedPin).emit('setup')
        console.log(rooms)
    })

    socket.on('disconnect', () => {
        let roomIndex
        rooms.some((room, i) => {
            if (room[socket.id]) {
                roomIndex = i
                room.removePlayer(socket.id)
                return true
            }
        })

        if (roomIndex > -1 && rooms[roomIndex].persons < 1) {
            // If the room is now empty remove the room from the array. Array can become empty, thats ok.
            rooms.splice(roomIndex, 1)
        }

        console.log(rooms)
    })
})

http.listen(port, () => {
    console.log(`Listening on: ${port}`)
})