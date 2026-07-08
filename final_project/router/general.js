const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Please provide both username and password."
        });
    }

    if (isValid(username)) {
        return res.status(400).json({
            message: "User already exists!"
        });
    }

    users.push({
        name: username,
        pass: password
    });

    return res.status(201).json({
        message: "New user registered!"
    });
});

// Get all books
public_users.get("/", (req, res) => {
    return res.json(books);
});

// Get by ISBN
public_users.get("/isbn/:isbn", (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: "Book not found!"
        });
    }

    return res.json(book);
});

// Get by Author
public_users.get("/author/:author", (req, res) => {

    const author = req.params.author.toLowerCase();

    const result = Object.values(books).filter(
        book => book.author.toLowerCase() === author
    );

    if (result.length === 0) {
        return res.status(404).json({
            message: "No books found for this author."
        });
    }

    return res.json(result);
});

// Get by Title
public_users.get("/title/:title", (req, res) => {

    const title = req.params.title.toLowerCase();

    const result = Object.values(books).filter(
        book => book.title.toLowerCase() === title
    );

    if (result.length === 0) {
        return res.status(404).json({
            message: "No books found for this title."
        });
    }

    return res.json(result);
});

// Get Reviews
public_users.get("/review/:isbn", (req, res) => {

    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: "Book not found!"
        });
    }

    return res.json(book.reviews);
});

// Task 10
public_users.get("/books", async (req, res) => {

    try {

        const response = await axios.get("http://localhost:5000/");

        return res.json(response.data);

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});

// Task 11
public_users.get("/books/isbn/:isbn", async (req, res) => {

    try {

        const response = await axios.get(
            `http://localhost:5000/isbn/${req.params.isbn}`
        );

        return res.json(response.data);

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});

// Task 12
public_users.get("/books/author/:author", async (req, res) => {

    try {

        const response = await axios.get(
            `http://localhost:5000/author/${encodeURIComponent(req.params.author)}`
        );

        return res.json(response.data);

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});

// Task 13
public_users.get("/books/title/:title", async (req, res) => {

    try {

        const response = await axios.get(
            `http://localhost:5000/title/${encodeURIComponent(req.params.title)}`
        );

        return res.json(response.data);

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }

});

module.exports.general = public_users;