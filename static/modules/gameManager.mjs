import socketHandler from './socketHandler.mjs'
import cardManager from './cardManager.mjs'
import userManager from './userManager.mjs'
import state from './state.mjs'

var gameManager = (function() {
    // function and variables.
    const overlay = document.getElementById('before-game-overlay')
    const field = document.querySelector('.field')

    function startButton() {
        const button = document.createElement('button')
        button.setAttribute('data', 'start_game')
        button.innerText = 'Start the game!'

        button.addEventListener('click', function() {
            socketHandler.emit('start game', state.pin)
        })

        return button
    }

    function winnerOverlay(winner) {
        const div = document.createElement('div')
        div.classList.add('winner-overlay')

        const p = document.createElement('p')
        p.innerText = `${winner.username} had the best card this round, congrats!`
        
        const button = document.createElement('button')
        button.innerText = 'Next round'

        button.addEventListener('click', function() {
            socketHandler.emit('next round')
        })

        div.appendChild(p)
        div.appendChild(button)
        return div
    }

    function displayWinner(winner) {
        field.insertAdjacentElement('afterbegin', winnerOverlay(winner))
    }

    return {
        // methods
        removeOverlay() {
            overlay.remove()
        },

        addStartButton() {
            overlay.insertAdjacentElement('beforeend', startButton())
        },

        startGame(allowed, blackCard) {
            if (allowed) {
                this.removeOverlay()
                const starting_player = state.players[0]
                cardManager.setPickingPlayer(starting_player, blackCard)
            } else {
                console.log('not enough players yet!')
            }
        },

        cleanUpPreviousRound() {
            state.picking = false
            state.has_picked = false

            cardManager.reset()
        },

        startRound(roomDetails) {
            this.cleanUpPreviousRound()
            const whos_turnIndex = roomDetails.room.whos_turn
            const current_picker = state.players[whos_turnIndex]
            document.querySelector('.winner-overlay').remove()
            cardManager.setPickingPlayer(current_picker, roomDetails.blackCard)
            console.log('Start the round')
        },

        winnerChosen(winner) {
            displayWinner(winner)

            if (state.picking) {
                state.picking = false
                cardManager.toggleCardHolderLock()
            }

            userManager.addPoint(winner)
        }
    }
})()

export default gameManager