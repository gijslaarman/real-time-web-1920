class Room {
    constructor(pin, deck) {
        this.pin = pin
        this.persons = 0
        this.joined = []
        this.deck = deck
        this.playfield = []
        this.in_play = false
        this.whos_turn = 0
    }

    addPlayer(userObj) {
        this.persons++
        this.joined.push(userObj.UUID)
        this[userObj.UUID] = userObj
    }

    removePlayer(UUID) {
        this.persons--
        const indexOfPlayer = this.joined.findIndex(player => player === UUID)
        this.joined.splice(indexOfPlayer, 1)
        this[UUID].cards.forEach(card => this.deck.whiteCards.push(card)) // Add cards back to the game deck.
        delete this[UUID]
    }

    getPlayers() {
        const playerArray = []
        this.joined.forEach(player => {
            playerArray.push(this[player])
        })

        return playerArray
    }

    addCardToPlayfield(card, UUID) {
        card.from_player = UUID
        this.playfield.push(card)
    }

    emptyPlayfield() {
        this.playfield = []
    } 
}

module.exports = Room