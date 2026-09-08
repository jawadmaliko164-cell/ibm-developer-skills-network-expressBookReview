const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    const accessToken = jwt.sign(
        { username },
        process.env.JWT_SECRET || "mysecretkey",
        { expiresIn: "1h" }
    );

    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "Login successful.", token: accessToken });
});
// Authenticated users can add or modify a book review.
regd_users.put("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;
    let username = req.session.authorization?.username;

    if (token) {
        try {
            username = jwt.verify(
                token,
                process.env.JWT_SECRET || "mysecretkey"
            ).username;
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    }

    if (!username) {
        return res.status(401).json({ message: "Authentication required." });
    }

    // Check if review text is provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Add or modify review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/modified successfully.",
        reviews: books[isbn].reviews
    });
});
// deleting a book review
regd_users.delete("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;
    let username = req.session.authorization?.username;

    if (token) {
        try {
            username = jwt.verify(
                token,
                process.env.JWT_SECRET || "mysecretkey"
            ).username;
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    }

    if (!username) {
        return res.status(401).json({ message: "Authentication required." });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the user has a review to delete
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user." });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully.",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
