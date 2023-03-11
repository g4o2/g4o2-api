const express = require('express');
const app = express();
const fs = require('fs');
const mysql = require('mysql')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        // origin: ['https://php-sql-chat.maxhu787.repl.co:*', 'http://localhost:*']
        origin: ['http://localhost']
    }
});
//mysql connection

    let con = mysql.createConnection({
    host: 'localhost',
    user: 'g4o2',
    database: 'sql12561191',
    password: 'g4o2'
});

/*
var con = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12561191',
    database: 'sql12561191',
    password: process.env.DB_PASS
});
*/

app.use('/\*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

//express api
app.get('/', (req, res) => {
    data = [
        { "message": "Welcome to the g4o2-chat api and socket.io server" },
        { "directories": [
                "/messages",
                "/db/users",
                "/db/messages"
            ]
        }
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

app.get('/db', (req, res) => {
    data = [
        {"directories": [
                "/db/users",
                "/db/messages"
            ]
        }
    ]
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 3));
})

app.get('/db/messages', (req, res) => {
    let message_id = req.query.id;
    if(!message_id) {
        data = {
            "usage": "/db/messages?id=(message_id))"
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 3));
    } else {
        var sql = 'SELECT * FROM chatlog WHERE message_id=?';
        con.query(sql, [message_id], function (err, responce) {
            if (err) throw err;
            data = {
                "message_id": responce[0]['message_id'],
                "message": responce[0]['message'],
                "message_date": responce[0]['message_date'],
                "account": responce[0]['account'],
                "user_id": responce[0]['user_id']
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
    con.query(sql, [user_id], function (err, responce) {
        if (err) console.log(error);
        let email;
        if (responce[0]['show_email'] !== "True") {
            email = "Hidden";
        } else {
            email = responce[0]['email']
        }
        data = {
            "user_id": responce[0]['user_id'],
            "username": responce[0]['username'],
            "name": responce[0]['name'],
            "email": email,
            "about": responce[0]['about']
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 3));
    });
});

app.get('/db/test', (req, res) => {
    var sql = 'SELECT * FROM chatlog';
    con.query(sql, function (err, responce) {
        if (err) console.log(error);
        data = {
            responce
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
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});