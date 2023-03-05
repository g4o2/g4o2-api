const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
/*
app.use('/\*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})
*/

app.get('/', (req, res) => {
    data = [
        { "message": "Welcome to g4o2-chat socket.io api" },
        { "message": "go to /messages to see the chatlog"}
    ];
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 3));
});

app.get('/messages', (req, res) => {
    fs.readFile('./chatlog.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        data = data + "]";
        data = JSON.parse(data);
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 3));
    });
});

/*
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
*/

io.engine.on("headers", (headers, req) => {
    headers["Access-Control-Allow-Origin"] = "https://php-sql-chat.maxhu787.repl.co/";
});

io.origins(["https://php-sql-chat.maxhu787.repl.co/"]);

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
        data = ",\r\n" + data;
        fs.appendFile('./chatlog.json', data, err => {
            if (err) {
                console.error(err);
            }
        });
    });
    socket.on('load-messages', (username) => {
        fs.readFile('./chatlog.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            data = data + "]";
            data = JSON.parse(data);
            console.log(data);
            io.emit('load-messages', data);            
        });
    })
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});