const express = require('express');
const app = express();
const fs = require('fs');
const mysql = require('mysql')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://php-sql-chat.maxhu787.repl.co"
    }
});
//mysql connection
/*
    let con = mysql.createConnection({
    host: 'localhost',
    user: 'g4o2',
    database: 'sql12561191',
    password: 'g4o2'
});
*/
var con = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12561191',
    database: 'sql12561191',
    password: process.env.DB_PASS
});

/*
app.use('/\*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})
*/
//express api
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

app.get('/db/messages', (req, res) => {
    let message_id = req.query.id;
    if(!message_id) {
        data = {
            "error": "id parameter not set (example: /db/messages?id=1)"
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 3));
    } else {
        var sql = 'SELECT * FROM chatlog WHERE message_id=?';
        con.query(sql, [message_id], function (err, result) {
            if (err) throw err;
            data = {
                "message_id": result[0]['message_id'],
                "message": result[0]['message'],
                "message_date": result[0]['message_date'],
                "account": result[0]['account'],
                "user_id": result[0]['user_id']
            };
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data, null, 3));
        });
    }
});

app.get('/db/users', (req, res) => {
    data = {
        "usage": "/db/users/(user id)"
    };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 3));
});

app.get('/db/users/:userId', (req, res) => {
    let user_id = req.params.userId;
    var sql = 'SELECT * FROM account WHERE user_id=?';
    con.query(sql, [user_id], function (err, result) {
        if (err) console.log(error);
        let email;
        if (result[0]['show_email'] !== "True") {
            email = "Hidden";
        } else {
            email = result[0]['email']
        }
        data = {
            "user_id": result[0]['user_id'],
            "username": result[0]['username'],
            "name": result[0]['name'],
            "email": email,
            "about": result[0]['about']
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 3));
    });
});
//socket.io server
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