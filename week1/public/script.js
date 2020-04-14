(function () {
	var socket = io()
	let users = []
	var connected = false
	var messages = document.querySelector('#messages')

	class Person {
		constructor(person) {
			this.nickname = person.nickname,
			this.UUID = person.UUID,
			this.color = person.color,
			this.attributes = person.attributes
		}

		addToOnline() {
			var onlineElement = document.querySelector('.online')
			return onlineElement.insertAdjacentElement('beforeend', this.createElement())
		}

		moveToOffline(UUID) {
			var onlineElement = document.querySelector('.online')
			var offlineElement = document.querySelector('.offline')

			onlineElement.querySelector(`[uuid=${UUID}]`).remove()
			offlineElement.insertAdjacentElement('afterbegin', this.createElement())
		}

		createElement() {
			var li = document.createElement('li')
			var p = document.createElement('p')
			p.innerText = this.nickname

			li.setAttribute('style', `background-color: ${this.color}`)
			li.setAttribute('uuid', this.UUID)
			li.appendChild(p)
			return li
		}
	}

	// Receiving a message
	socket.on('message', function (msg) {
		console.log(msg)
		var messageTypes = [
			{ type: 'notification', function: createNotification },
			{ type: 'message', function: createMessage }
		]

		messages.insertAdjacentElement('beforeend',
			messageTypes.find(obj => obj.type === msg.type).function.call(this, msg))
	})

	socket.on('new user', async function(person) {
		var newUser = new Person(person)
		newUser.addToOnline()
		users.push(newUser)
		return console.log(users)
	})

	// Send the user the load event (socket.emit), shows all users currently online in the left side.
	socket.on('load event', function(users) {
		users.forEach(user => {
			var person = new Person(user.person)
			person.addToOnline()
		})
	})

	socket.on('user left', function(person) {
		var leftUser = users.find(user => person.UUID === user.UUID)
		leftUser.moveToOffline(leftUser.UUID)
	})

	// Sending new user signed up
	var enterChatForm = document.querySelector('.before-enter')
	enterChatForm.addEventListener('submit', function (e) {
		e.preventDefault()
		var nickname = document.querySelector('.nickname-input').value
		socket.emit('new user', nickname)

		// Allow user the chat
		return enterChat(nickname)
	})

	// Sending a text message
	var messageForm = document.querySelector('.send-message')
	messageForm.addEventListener('submit', function (e) {
		e.preventDefault()
		var message = document.querySelector('#m')
		socket.emit('chat message', message.value)
		m.value = ''
		return false
	})

	function enterChat() {
		enterChatForm.remove()
		connected = true
	}

	function createNotification(msg) {
		var li = document.createElement('li')
		li.classList.add('notification')
		var p = document.createElement('p')
		p.innerText = msg.text
		li.appendChild(p)
		return li
	}

	function createMessage(msg) {
		console.log(msg)
		var message = msg.text
		var user = msg.nickname
		var uuid = msg.uuid

		var li = document.createElement('li')
		// If the user send the message himself add a class to align the text to the right
		if (uuid === socket.id) {
			li.classList.add('my-message')
		} else {
			var div = document.createElement('div')
			var backgroundColor = window.getComputedStyle(document.querySelector(`[uuid=${uuid}]`)).getPropertyValue('background-color')

			div.innerText = user.charAt(0)
			div.setAttribute('style', `background-color: ${backgroundColor}`)
			li.appendChild(div)
		}

		var textElement = document.createElement('p')
		textElement.innerText = message
		li.appendChild(textElement)

		return li
	}
})()








// function createMessage(msg) {
//     var li = document.createElement('li')
//     li.innerText = msg
//     return li
// }

// (function () {
//     var socket = io()
//     var form = document.querySelector('.send-message')

//     form.addEventListener('submit', function (e) {
//         e.preventDefault()
//         var message = document.querySelector('#m')
//         socket.emit('chat message', message.value)
//         m.value = ''
//         return false
//     })

//     socket.on('chat message', msg => {
//         var messages = document.querySelector('#messages')
//         messages.insertAdjacentElement('beforeend', createMessage(msg))
//     })
// }())