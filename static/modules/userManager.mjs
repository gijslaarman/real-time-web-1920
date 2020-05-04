import socketHandler from './socketHandler.mjs'
import state from './state.mjs'

var userManager = (function () {
    const invite_friend_block = document.querySelector('[copy_pin].open')
    const users = document.getElementById('users')

    function userTemplate(user) {
        return `
        <article user="u-${user.UUID}">
            <div class="text">
                <h4 ${user.isThisUser ? 'class="user"' : 'class'}>${user.username}</h4>
                <h5>@${user.handle}</h5>
            </div>
            <div id="points">
                <p>0</p>
            </div>
        </article>`
    }

    function addUserBlockChecker() {
        const amountOfUsers = users.childElementCount

        if (amountOfUsers > 6) { // If more than 6 because the 'invite user block' is also counted.
            invite_friend_block.classList.add('hidden')
        } else {
            invite_friend_block.classList.remove('hidden')
        }
    }

    return {
        addUser(user) {
            state.players.push(user)
            user.isThisUser = user.UUID == socketHandler.getUUID()
            users.insertAdjacentHTML('afterBegin', userTemplate(user))

            addUserBlockChecker()
        },

        removeUser(user) {
            console.log('left', user)
            var userElement = users.querySelector(`[user=u-${user.UUID}]`)
            userElement.remove()
            state.players_amount--
            state.player.splice(state.players.findIndex(player => player.UUID === user.UUID), 1)
            addUserBlockChecker()
        },

        addPoint(user) {
            var userPoints = users.querySelector(`[user=u-${user.UUID}] #points p`)
            userPoints.innerText = user.points
        }
    }
})()

export default userManager