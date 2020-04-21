class Room {
    constructor(pin, userObj) {
        this.pin = pin
        this.persons = 0
        this.joined = []
        this.addPlayer(userObj)
    }

    addPlayer(userObj) {
        this.persons++
        this.joined.push(userObj.UUID)
        this[userObj.UUID] = {
            UUID: userObj.UUID,
            username: userObj.username,
            points: 0,
            handle: userObj.handle
        }
    }

    removePlayer(UUID) {
        this.persons--
        const indexOfPlayer = this.joined.findIndex(player => player === UUID)
        this.joined.splice(indexOfPlayer, 1)
        delete this[UUID]
    }

    getPlayers() {
        const playerArray = []
        this.joined.forEach(player => {
            playerArray.push(this[player])
        })

        return playerArray
    }
}

module.exports = Room