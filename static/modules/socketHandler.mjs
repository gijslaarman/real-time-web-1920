import { makeGameRoom } from './setup.mjs'
import cardManager from './cardManager.mjs'
import userManager from './userManager.mjs'
import gameManager from './gameManager.mjs'
import state from './state.mjs'

var socketHandler = (function () {
    var socket = io()

    socket.on('joining room', function (roomDetails) {
        makeGameRoom(roomDetails.pin, roomDetails[socket.id].cards)
        roomDetails.joined.forEach(player => userManager.addUser(roomDetails[player]))
        state.players_amount = roomDetails.persons
        state.in_play = roomDetails.in_play ? true : false

        console.log(state)

        if (state.in_play) {
            gameManager.removeOverlay()
        }
    })

    socket.on('setup', function (room, user) {
        userManager.addUser(user) // Add user to the game.
        state.players_amount = 1
        state.in_play = room.in_play ? true : false

        console.log(state)
        makeGameRoom(room.pin, user.cards)
        gameManager.addStartButton()
    })

    socket.on('user joined', function (user) {
        userManager.addUser(user)
        state.players_amount++
    })

    socket.on('user left', function (user) {
        userManager.removeUser(user)
        state.players_amount--
    })

    socket.on('start game', function(data) {
        gameManager.startGame(data.start, data.blackCard)
    })

    socket.on('pick a card', function () {
        state.picking = true
    })

    socket.on('start round', function(room) {
        gameManager.startRound(room)
    })

    socket.on('player played card', function(cardId) {
        cardManager.playCard(cardId)
    })

    socket.on('flip the cards', function(cards) {
        cardManager.flipCards(cards)
    })

    socket.on('winner chosen', function(uuid) {
        gameManager.winnerChosen(uuid)
    })

    return {
        emit: function (event, value) { socket.emit(event, value) },
        getUUID: function() { return socket.id}
    }
})()

export default socketHandler