const socket = io()

const clientsTotal = document.querySelector('#clients-total')

const messageContainer = document.querySelector('#message-container')
const nameInput = document.querySelector('#name-input')
const messageForm = document.querySelector('#message-form')
const messageInput = document.querySelector('#message-input')

const messageTone = new Audio('/message-tone.mp3')

nameInput.value = chance.name()

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendMessage()
})

function sendMessage() {
    if (messageInput.value === '') return
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date()
    }
    socket.emit('message', data)
    addMessageToUI(true, data)
    messageInput.value = ''
}

socket.on('clients-total', (data) => {
    clientsTotal.innerText = `Total Clients: ${data}`
})

socket.on('chat-message', (data) => {
    messageTone.play()
    addMessageToUI(false, data)
})

function addMessageToUI(isOwnMessage, data) {
    clearFeedback()
    const element = `
    <li class="message-${isOwnMessage ? "right" : "left"}">
        <p class="message">
            ${data.message}
            <p class="message-info">${isOwnMessage ? "" : data.name + " • "}${moment(data.dateTime).format('MM/DD/YYYY • h:mm a')}</p>
        </p>
    </li>
    `
    messageContainer.innerHTML += element
    scrollToBottom()
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', (e) => {
    setTimeout(function () {
        if (!messageInput.value === '') {
            socket.emit('feedback', {
                feedback: `${nameInput.value} is typing...`,
            })
        }
    }, 100);
})

messageInput.addEventListener('keydown', (e) => {
    setTimeout(function () {
        if (messageInput.value === '') {
            socket.emit('feedback', {
                feedback: '',
            })
        } else {
            socket.emit('feedback', {
                feedback: `${nameInput.value} is typing...`,
            })
        }
    }, 100);
})

messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
        feedback: '',
    })
})

socket.on('feedback', (data => {
    clearFeedback()
    const element = `
    <li class="message-feedback">
        <p class="feedback" id="feedback">
            ${data.feedback}
        </p>
    </li>
    `
    messageContainer.innerHTML += element
}))

function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach(element => {
        element.parentNode.removeChild(element)
    })
}