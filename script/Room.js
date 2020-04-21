class Room {
    constructor(pin, userObj) {
        this.pin = pin
        this.persons = 0
        this.addPlayer(userObj)
    }

    addPlayer(userObj) {
        this.persons++
        this[userObj.UUID] = {
            nickname: userObj.username,
            points: 0,
            handle: userObj.handle
        }
    }

    removePlayer(UUID) {
        this.persons--
        delete this[UUID]
    }
}

module.exports = Room