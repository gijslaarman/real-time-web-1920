const fs = require('fs')
const rcolor = require('rcolor')

const colorAmount = 20
const colors = []
let i = 0

while (i < colorAmount) {
    colors.push(rcolor())
    i++
}

fs.writeFile('colors.json', JSON.stringify(colors), 'utf8', (err) => {
    if (err) throw err
    console.log('Color file made!')
})