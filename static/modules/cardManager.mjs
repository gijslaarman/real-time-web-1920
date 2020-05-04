import state from "./state.mjs"
import socketHandler from "./socketHandler.mjs"
import userManager from "./userManager.mjs"

var cardManager = (function() {
    const playfield = document.querySelector('.playfield')
    const cardHolder = document.getElementById('my-cards')

    function addCardToPlayfield(card) {
        state.has_picked = true
        socketHandler.emit('user played card', card)
    }

    function createPlayedCard(id) {
        var index = playfield.childElementCount

        return `
    <article data="c-${id}" class="card">
        <div class="card-body" style="transition-delay: ${index * 200}ms">
            <div class="logo card-front">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#1DA1F2" width="72" height="72" viewBox="0 0 72 72"><path d="M67.812 16.141a26.246 26.246 0 0 1-7.519 2.06 13.134 13.134 0 0 0 5.756-7.244 26.127 26.127 0 0 1-8.313 3.176A13.075 13.075 0 0 0 48.182 10c-7.229 0-13.092 5.861-13.092 13.093 0 1.026.118 2.021.338 2.981-10.885-.548-20.528-5.757-26.987-13.679a13.048 13.048 0 0 0-1.771 6.581c0 4.542 2.312 8.551 5.824 10.898a13.048 13.048 0 0 1-5.93-1.638c-.002.055-.002.11-.002.162 0 6.345 4.513 11.638 10.504 12.84a13.177 13.177 0 0 1-3.449.457c-.846 0-1.667-.078-2.465-.231 1.667 5.2 6.499 8.986 12.23 9.09a26.276 26.276 0 0 1-16.26 5.606A26.21 26.21 0 0 1 4 55.976a37.036 37.036 0 0 0 20.067 5.882c24.083 0 37.251-19.949 37.251-37.249 0-.566-.014-1.134-.039-1.694a26.597 26.597 0 0 0 6.533-6.774z"></path></svg>
            </div>
        </div>
    </article>`
    }

    function createCard(card) {
        const li = document.createElement('li')
        li.setAttribute('data', card.id)

        const p = document.createElement('p')
        p.innerHTML = card.text

        li.appendChild(p)

        li.addEventListener('click', function() {
            // User chose this card.
            if (state.picking == true && state.has_picked == false) {
                addCardToPlayfield(card)
            } else {
                // User doesn't need to pick a card right now.
                alert('you already picked a card!')
            }
        })

        return li
    }

    function getTotalPlayedCards() {
        return playfield.childElementCount
    }

    function changePickerCard(user, blackCard) {
        const card = document.querySelector('.choosers-tweet')
        card.innerHTML = `
        <div>
            <header>
                <h4>${user.username}</h4>
                <h5>@${user.handle}</h5>
            </header>

            <p>${blackCard.text}<p>
        </div>`
    }

    function createPickedCardBackside(card) {
        const backside = document.createElement('div')
        backside.classList.add('card-back')
        backside.setAttribute('data', card.id)

        const p = document.createElement('p')
        p.innerHTML = card.text

        backside.appendChild(p)

        backside.addEventListener('click', function() {
            const cardId = this.getAttribute('data')
            socketHandler.emit('picker picked card', cardId)
        })

        return backside
    }

    return {
        generateCards(cards, emitEvent) {
            cards.forEach(card => {
                cardHolder.insertAdjacentElement('beforeend', createCard(card, emitEvent))
            })
        },

        playCard(card) {
            playfield.insertAdjacentHTML('beforeend', createPlayedCard(card))

            if (getTotalPlayedCards() === (state.players_amount - 1)) {
                console.log('Flip the cards')
                // Time to show the cards!
                // Add data to the cards.
                // flip the cards.
                socketHandler.emit('flip cards') // BUG: This currently fires the amount of times as there are people, should only emit once.
            }
        },

        setPickingPlayer(user, blackCard) {
            const userElement = document.querySelector(`[user=u-${user.UUID}]`)
            userElement.classList.add('picking')
            const clientUser = socketHandler.getUUID()
            changePickerCard(user, blackCard)

            if (clientUser == user.UUID) {
                // If the user is the picker.
                state.picking = true
                console.log(state)
                this.toggleCardHolderLock()
            }
        },

        reset() {
            while (playfield.firstChild) playfield.removeChild(playfield.firstChild)
            
        },

        toggleCardHolderLock() {
            cardHolder.parentElement.classList.toggle('locked')
        },

        flipCards(cards) {
            cards.forEach(card => {
                const placedCard = playfield.querySelector(`[data=c-${card.id}] .card-body`)
                placedCard.insertAdjacentElement('beforeend', createPickedCardBackside(card))
            })

            playfield.classList.add('flipped')

            console.log('Picking State: ' + state.picking)
            if (!state.picking) {
                playfield.classList.add('dont-touch')
            } else {
                playfield.classList.add('choose')
            }
        }
    }
})()

export default cardManager