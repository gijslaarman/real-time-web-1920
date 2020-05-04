const axios = require('axios')
const cah = axios.create({
    baseURL: 'https://cards-against-humanity-api.herokuapp.com/sets/'
})

module.exports = {
    async getDeck(rounds, players) {
        rounds = 5 // For now hardcoded as there's no support for this yet.
        players = 4

        const whiteCards = await this.getWhiteCard(rounds * players * 7)
        const blackCards = await this.getBlackCard(rounds * players)

        return {
            blackCards: blackCards,
            whiteCards: whiteCards
        }
    },
    async getWhiteCard(amount) {
        return new Promise((resolve, reject) => {
            db.collection('whiteCards').aggregate([{ $sample: { size: amount } }]).toArray()
            .then(res => resolve(res))
            .catch(err => reject(err))
        })
    },
    async getBlackCard(amount) {
        return new Promise((resolve, reject) => {
            db.collection('blackCards').aggregate([{ $sample: { size: amount } }]).toArray()
            .then(res => resolve(res))
            .catch(err => reject(err))
        })
    },
    // DANGER! Limit the use of this.
    clearDb() {
        db.collection('blackCards').drop()
        db.collection('whiteCards').drop()
    },
    generateDbData() {
        cah.get().then(res => res.data)
            .then(sets => {
                sets.forEach(set => {
                    cah.get(set.setName).then(res => res.data)
                        .then(set => {
                            this.insertSetToDb(set)
                        })
                })
            })
    },
    insertSetToDb(set) {
        db.collection('blackCards').insertMany(set.blackCards)
        db.collection('whiteCards').insertMany(set.whiteCards.map(content => { return { text: content } }))
    }
}