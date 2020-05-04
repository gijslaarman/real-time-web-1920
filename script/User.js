module.exports = class {
    constructor(UUID, username, handle) {
        this.UUID = UUID
        this.username = username
        this.handle = handle
        this.cards = []
        this.points = 0
    }
}