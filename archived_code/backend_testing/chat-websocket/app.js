const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`Chat server on port ${PORT}`))

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', onConnected)

let socketsConnected = new Set()

function onConnected(socket) {
    console.log('New Socket:', socket.id)
    socketsConnected.add(socket.id)

    io.emit('clients-total', socketsConnected.size)

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id)
        socketsConnected.delete(socket.id)
        io.emit('clients-total', socketsConnected.size)
    })

    socket.on('message', (data) => {

        console.log(
            '\n' + `New message from "${data.name}"`,
            '\n' + `Message: "${data.message}"`,
            '\n' + `Timestamp: ${data.dateTime}`
        );

        socket.broadcast.emit('chat-message', data)
    })

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data)
    })
}