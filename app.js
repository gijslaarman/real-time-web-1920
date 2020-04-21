require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const generateTwitterHandle = require('username-generator')
const generatePin = require('./script/generatePin.js')
const Room = require('./script/Room.js')
const MongoClient = require('mongodb').MongoClient
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
    function createUserObj(username) {
        return {
            UUID: socket.id,
            username,
            handle: generateTwitterHandle.generateUsername()
        }
    }

    socket.on('join room', values => {
        const userObj = createUserObj(values.username)
        const index = rooms.findIndex(room => room.pin === values.roomPin)
        rooms[index].addPlayer(userObj)

        socket.join(values.roomPin)
        socket.broadcast.to(values.roomPin).emit('user joined', userObj)
        socket.emit('joining room', rooms[index]) // Send the room details
        console.log(rooms)
    })

    socket.on('create new room', values => {
        const generatedPin = generatePin(5)
        const userObj = createUserObj(values.username)

        // !! TODO !! Fetch a bunch load of tweets. 

        // Add room to the array.
        rooms.push(new Room(generatedPin, userObj))

        // Put socket in the room, and push setup event.
        socket.join(generatedPin)
        io.to(generatedPin).emit('setup', generatedPin, userObj)
        console.log(rooms)
    })

    socket.on('disconnect', () => {
        let roomIndex
        let thisUser

        rooms.some((room, i) => {
            if (room[socket.id]) {
                roomIndex = i
                thisUser = room[socket.id]
                room.removePlayer(socket.id)
                return true
            }
        })

        if (thisUser) {
            console.log(thisUser)
            socket.broadcast.emit('user left', thisUser)
        }

        if (roomIndex > -1 && rooms[roomIndex].persons < 1) {
            // If the room is now empty remove the room from the array. Array can become empty, thats ok.
            rooms.splice(roomIndex, 1)
        }

        console.log(rooms)
    })
})

// Mongo setup, don't forget to set the mongo uri in your environment/.env 
const client = new MongoClient(process.env.db_uri, { useNewUrlParser: true, useUnifiedTopology: true })

http.listen(port, () => {
    console.log(`Listening on: ${port}`)
    client.connect(err => {
        db = client.db("TAT")
    })
})