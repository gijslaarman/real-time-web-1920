(function () {
	var socket = io()
	var connected = false
	var messages = document.querySelector('#messages')

	// Receiving a message
	socket.on('message', function (msg) {
		var messageTypes = [
			{ type: 'notification', function: createNotification },
			{ type: 'message', function: createMessage }
		]

		messages.insertAdjacentElement('beforeend',
			messageTypes.find(obj => obj.type === msg.type).function.call(this, msg))
	})

	// Sending new user signed up
	var enterChatForm = document.querySelector('.before-enter')
	enterChatForm.addEventListener('submit', function (e) {
		e.preventDefault()
		var nicknameInput = document.querySelector('.nickname-input')

		socket.nickname = nicknameInput.value
		socket.emit('new user', nicknameInput.value)

		// Allow user the chat
		return enterChat()
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
		var typeOfMsg = msg.type
		var uuid = msg.uuid

		var li = document.createElement('li')
		// If the user send the message himself add a class to align the text to the right
		if (uuid === socket.id) {
			li.classList.add('my-message')
		} else {
			var div = document.createElement('div')
			div.innerText = user.charAt(0)
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