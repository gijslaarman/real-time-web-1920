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
                    console.log(values.roomPin)
                } else {
                    renderError('Room not found.')
                }
            }).catch(() => {
                renderError('Sorry something went wrong, we currently cannot connect to our service. Try again later.')
            })
    } else {
        alert('create new room!')
        socket.emit('create new room', '')
    }

    // console.log(values)
})