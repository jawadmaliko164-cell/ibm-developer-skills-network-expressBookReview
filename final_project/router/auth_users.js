const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { // returns boolean
    return users.find(user => user.name === username);
};

const authenticatedUser = (username, password) => { // returns boolean
    const user = isValid(username);
    if (user === undefined) {
        return false;
    }

    return user.pass === password;
};

//only registered users can login
const secret = "shhh....";

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username or password missing!"
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password!"
        });
    }

    const accessToken = jwt.sign(
        { username },
        secret,
        { expiresIn: "1h" }
    );

    req.session.authorization = {
        accessToken
    };


    return res.status(200).json({
        message: "User successfully logged in."
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found!"
        });
    }
    
    const username = req.user.username;
    
    books[isbn].reviews[username] = review;
    
    return res.status(200).json({
        message: "Review added/updated successfully."
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    const username = req.user.username;
    
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found."
        });
    }
    
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review not found."
        });
    }
    
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully."
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
