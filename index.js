const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');

app.get('/', (req, res) => {
    data = { "msg": "Welcome to g4o2-chat socket.io api" };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 3));

});

/*app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});*/

io.on('connection', (socket) => {
    socket.on('user-connect', (username) => {
        console.log(`user ${username} connected`);
        io.emit('user-connect', username);
    })
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('message-submit', (messageDetails) => {
        io.emit('message-submit', messageDetails);
        console.log(messageDetails);
        let data = JSON.stringify(messageDetails);
        data = data.concat(",\r\n");
        fs.appendFile('./chatlog.json', data, err => {
            if (err) {
                console.error(err);
            }
        });
    });
    socket.on('load-messages', (username) => {
        let rows = "load chat";
        io.emit('load-messages', rows);            
    })
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});