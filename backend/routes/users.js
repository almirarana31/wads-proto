const express = require('express');
const Joi = require('joi');
const fs = require('fs');

const router = express.Router();
router.use(express.json());

// Creating validation function
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string()
        .required(),
        email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required,
        password: Joi.string()
        .min(8)
        .required()
    })

    const result = schema.validate(user);

    return result;
}

// dummy database
function readDatabase() {
    let obj;    
    fs.readFile("./database/users.json", "utf-8", (err, data) => {
        if (err) throw err;
        obj = data; // gets database and parses JSON string into JS object
        console.log("In readDatabase: ",obj)
        return obj;
    })
}

// GET Users info
router.get("/users", (req, res) => {
    const users = readDatabase();
    console.log("Getting worked!", users);
    res.send(users);
});

// POST Users info
router.post("/users", (req, res) => {
    var users = readDatabase(); 
    // get data to be added
    // validate
    const result = validateUser(req.body);
    const {error} = result; 

    if ({error}) {
       return res.status(400).send(error.details[0].message);
    }

    const new_user = req.body;
    
    // add and return
    
});

module.exports = router;