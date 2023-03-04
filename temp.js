const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mysql = require('mysql')
/*
var con = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12561191',
    database: 'sql12561191',
    password: process.env.DB_PASS
});
*/
let con = mysql.createConnection({
    host: 'localhost',
    user: 'g4o2',
    database: 'sql12561191',
    password: 'g4o2'
});
app.get('/', (req, res) => {
    data = { "msg": "hello" };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 3));
});
/*
app.get('/message/:messageId', (req, res) => {
    let messageId = req.params.messageId;
    var sql = 'SELECT account, user_id, message FROM chatlog WHERE message_id=?';
    con.query(sql, [messageId], function (err, result) {
        if (err) throw err;
        data = { 
            "message_id": messageId,
            "account": result[0]['account'],
            "user_id": result[0]['user_id'],
            "message": result[0]['message']
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 3));
     });
});
*/
app.get('/message', (req, res) => {
    let messageId = req.query.id;
    var sql = 'SELECT account, user_id, message FROM chatlog WHERE message_id=?';
    con.query(sql, [messageId], function (err, result) {
        if (err) throw err;
        data = {
            "message_id": messageId,
            "account": result[0]['account'],
            "user_id": result[0]['user_id'],
            "message": result[0]['message']
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 3));
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});