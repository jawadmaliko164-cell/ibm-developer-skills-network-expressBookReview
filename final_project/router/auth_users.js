const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

/* -----------------------
   Helper Functions
------------------------*/

const isValid = (username) => {
    return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user =>
        user.username === username &&
        user.password === password
    );
};

/* -----------------------
   LOGIN ROUTE
------------------------*/

regd_users.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password required"
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid Login"
        });
    }

    let accessToken = jwt.sign(
        { username },
        "access",
        { expiresIn: "1h" }
    );

    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({
        message: "Login successful",
        accessToken
    });
});

/* -----------------------
   ADD / MODIFY REVIEW
------------------------*/

regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({
            message: "User not logged in"
        });
    }

    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added successfully"
    });
});

/* -----------------------
   DELETE REVIEW
------------------------*/

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({
            message: "User not logged in"
        });
    }

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const reviews = books[isbn].reviews;

    if (!reviews || !reviews[username]) {
        return res.status(404).json({
            message: "Review not found for this user"
        });
    }

    delete reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully"
    });
});

/* -----------------------
   EXPORTS
------------------------*/

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;