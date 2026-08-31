const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let existingUser = users.filter(user => user.username === username);
    return existingUser.length > 0;
}

const authenticatedUser = (username, password) => {
    let findUser = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return findUser.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here
    let { username, password } = req.body;

    if (isValid(username)) {
        if(authenticatedUser(username, password)) {
            let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60 * 60});

            req.session.authorization = {
                accessToken, username
            };

            return res.status(200).send("User successfully logged in");
        }else {
            res.status(208).json({ message: "Invalid Login. Check username and password" });
        }
    }else {
        res.status(403).json({message: "No such user Exists"})
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    //Write your code here
    return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
