require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const generateTwitterHandle = require('username-generator')
const generatePin = require('./script/generatePin.js')
const Room = require('./script/Room.js')
const fetchCards = require('./script/fetchCards')
const MongoClient = require('mongodb').MongoClient
const User = require('./script/User')
const port = process.env.PORT || 3000

// Cache
const rooms = {}
const allUsers = {}

// Folder for static assets, imgs, scripts & styling.
app.use(express.static('static'))

// No routes needed, IO will control all traffic & clients will handle the rendering.
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html')
})

app.post('/room-check', (req, res) => {
	// Returning a boolean based on if the room exists. So client side won't be able to figure out what rooms exists.
	// With the boolean the client side knows if to join a room or send an error message.
	if (rooms[req.query.pin]) {
		res.send(true)
	} else {
		res.send(false)
	}
})

// IO CONNECTION HANDLING.
io.on('connection', socket => {
	function pickSevenCards(pin) {
		// socket id & room pin needed.

		for (let i = 0; i < 7; i++) {
			const card = rooms[pin].deck.whiteCards.shift()
			card.id = generatePin(10) // Create randomized ID so users can't change the data field in game to match their favorite card.
			rooms[pin][socket.id].cards.push(card)
		}
	}

	function createPlayer(name, pin, options) {
		const user = new User(socket.id, name, generateTwitterHandle.generateUsername())

		if (options && options.is_host) {
			user.is_host = true
		} else {
			user.is_host = false
		}

		rooms[pin].addPlayer(user)

		allUsers[socket.id] = {
			user,
			room: pin
		}
	}

	// Joining

	socket.on('join room', values => {
		const pin = values.roomPin
		createPlayer(values.username, pin)
		pickSevenCards(pin)

		socket.join(pin)
		socket.broadcast.to(pin).emit('user joined', rooms[pin][socket.id])
		socket.emit('joining room', rooms[pin]) // Send the room details
		console.log(rooms)
		console.log(allUsers)
	})

	socket.on('create new room', values => {
		const generatedPin = generatePin(5)

		// Wait for the deck to be assembled.
		fetchCards.getDeck().then(deck => {
			// First create the room where the user can be put in.
			rooms[generatedPin] = new Room(generatedPin, deck)

			// Now create the user/player, gets auto assigned to the right room.
			createPlayer(values.username, generatedPin, { is_host: true })

			// Add 7 cards to this user.
			pickSevenCards(generatedPin)

			// Put socket in the room, and push setup event.
			socket.join(generatedPin)
			io.to(generatedPin).emit('setup', rooms[generatedPin], rooms[generatedPin][socket.id])
			console.log(rooms)
		})
	})




	// Playing
	socket.on('start game', pin => {
		const room = rooms[pin]

		if (room.persons > 1) {
			io.to(pin).emit('start game', { start: true, blackCard: room.deck.blackCards.shift() })
			socket.broadcast.to(pin).emit('pick a card')
		} else {
			socket.emit('start game', { start: false })
		}
	})

	socket.on('next round', () => {
		const pin = allUsers[socket.id].room
		const room = rooms[pin]

		if (room.whos_turn === room.persons - 1) {
			// If everyone had a turn start at 0 again.
			room.whos_turn = 0
		} else {
			room.whos_turn++
		}

		io.to(pin).emit('start round', { room, blackCard: room.deck.blackCards.shift()})
	})

	socket.on('user played card', card => {
		const pin = allUsers[socket.id].room
		rooms[pin].addCardToPlayfield(card, socket.id)

		console.log(rooms[pin].playfield)

		io.to(pin).emit('player played card', card.id)
	})

	socket.on('flip cards', () => {
		const pin = allUsers[socket.id].room
		const room = rooms[pin]

		// Async timeout.
		const smallTimeout = new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 500) })

		Promise.all([smallTimeout]).then(() => socket.to(pin).emit('flip the cards', room.playfield))
	})

	socket.on('picker picked card', cardId => {
		const pin = allUsers[socket.id].room
		const room = rooms[pin]
		const pickedCard = room.playfield.find(card => card.id === cardId)
		const winner = room[pickedCard.from_player]
		winner.points++

		io.to(pin).emit('winner chosen', winner)
	})

	// Disconnecting

	socket.on('disconnect', () => {
		let thisUser = allUsers[socket.id]

		// Catch if the user is reloading whilst on the login/creation screen > means that the user doesn't exist yet.
		if (thisUser) {
			socket.broadcast.emit('user left', thisUser.user)

			if (allUsers[socket.id]) {
				rooms[thisUser.room].removePlayer(socket.id)
				delete thisUser
			}

			if (rooms[thisUser.room].persons < 1) {
				// If the room is now empty remove the room from the array. Array can become empty, thats ok.
				delete rooms[thisUser.room]
			}
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