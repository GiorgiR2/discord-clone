const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const usersRouter = require('./routes/users.js');
const messagesRouter = require('./routes/messages.js');

require('./mongooseAPI.js');

require('dotenv').config(); // variables

const PORT = process.env.PORT || '5000';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('new connection');
    socket.on('join', (message, callback) => {
        // pass
    });

    socket.on('disconnect', (message, callback) => {
        // pass
    });
});

server.listen(PORT, () => console.log(`Server is on PORT: ${PORT}`));

app.use(usersRouter);
app.use(messagesRouter);
