const express = require('express');
const Joi = require('joi');
var fs = require('fs');
const users_router = require('./routes/users');
const app = express();

app.use(express.json());
app.use('/api', users_router);

// dummy database
var obj;
fs.readFile("./database/users.json", "utf-8", (err, data) => {
    if (err) throw err;
    obj = JSON.parse(data);
})

// PORT, .env variables
const port = process.env.PORT || 3000;

app.listen(port, (req, res) => {
    console.log(`Listening on port ${port}`);
});

// setting basic endpoints
app.get('/', (req, res) => {
    console.log(`Connect to server at port ${port}`);
    res.send(`Goodbye World`);
});