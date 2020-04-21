var socket = io()

function getFieldValues(form) {
    const inputFields = form.querySelectorAll('input')
    const values = {}

    inputFields.forEach(input => {
        if (input.type === 'submit') {
            values.submit = input.getAttribute('data')
        } else {
            values[input.name] = input.value
        }
    })

    return values
}

function renderError(msg) {
    const errorContainer = document.getElementById('error-container')
    while (errorContainer.firstChild) errorContainer.removeChild(errorContainer.firstChild)
    errorContainer.insertAdjacentHTML('afterbegin', `<p class="danger">${msg}</p>`)
}

function createNewRoom() {
    const PIN_UPPER_RIGHT = document.getElementById('game-pin')

}

(function() {
    // If there's a roompin in the query auto fill it in.
    const roomPinInput = document.querySelector('input[name=roomPin]')
    const label = document.getElementById('room-pin')
    const submit = document.querySelector('.login input[type=submit]')
    const urlParams = new URLSearchParams(location.search.substring(1)) // Create  Skip the '?' in the search string.
    const searchObj = Object.fromEntries(urlParams.entries())

    if (searchObj.roompin) {
        label.classList.remove('opaque')
        submit.value = "Join room"
        submit.setAttribute('data', 'join')
        roomPinInput.value = searchObj.roompin
    }
})()

const roomPinInput = document.querySelector('input[name=roomPin]')
roomPinInput.addEventListener('input', function () {
    const submit = document.querySelector('.login input[type=submit]')
    const label = document.getElementById('room-pin')

    if (this.value) {
        submit.value = 'Join room'
        label.classList.remove('opaque')
        submit.setAttribute('data', 'join')
    } else {
        submit.value = 'Create a new game room'
        label.classList.add('opaque')
        submit.setAttribute('data', 'create')
    }
})

const loginForm = document.querySelector('.login form')
loginForm.addEventListener('submit', function (e) {
    e.preventDefault()
    const values = getFieldValues(this)
    const postURL = `${window.location.origin}/room-check?pin=${values.roomPin}`

    if (values.roomPin) {
        fetch(postURL, { method: 'POST' })
            .then(res => res.json())
            .then(room => {
                // Resolves a boolean: true/false. If room exists = true, if not = false.
                if (room) {
                    // If this room exists start joining this room.
                    socket.emit('join room', values)
                } else {
                    renderError('Room not found.')
                }
            }).catch(() => {
                renderError('Sorry something went wrong, we currently cannot connect to our service. Try again later.')
            })
    } else {
        socket.emit('create new room', values)
    }
})

socket.on('setup', function() {
    const gamePin = document.getElementById('game-pin')
    gamePin.innerHTML = `${ef} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M568.482 177.448L424.479 313.433C409.3 327.768 384 317.14 384 295.985v-71.963c-144.575.97-205.566 35.113-164.775 171.353 4.483 14.973-12.846 26.567-25.006 17.33C155.252 383.105 120 326.488 120 269.339c0-143.937 117.599-172.5 264-173.312V24.012c0-21.174 25.317-31.768 40.479-17.448l144.003 135.988c10.02 9.463 10.028 25.425 0 34.896zM384 379.128V448H64V128h50.916a11.99 11.99 0 0 0 8.648-3.693c14.953-15.568 32.237-27.89 51.014-37.676C185.708 80.83 181.584 64 169.033 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48v-88.806c0-8.288-8.197-14.066-16.011-11.302a71.83 71.83 0 0 1-34.189 3.377c-7.27-1.046-13.8 4.514-13.8 11.859z"/></svg>`
})