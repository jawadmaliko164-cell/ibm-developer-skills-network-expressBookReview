const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user. Provide username and password."});
});

// Task 1 & 10: Get the book list available in the shop (Using Async/Await)
public_users.get('/', async function (req, res) {
    try {
        // Simulating an async operation as required by Task 10
        const getBooks = new Promise((resolve, reject) => {
            resolve(books);
        });
        const bookList = await getBooks;
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({message: "Error retrieving books"});
    }
});

// Task 2 & 11: Get book details based on ISBN (Using Promises)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    // Simulating a promise-based operation as required by Task 11
    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({message: err}));
});

// Task 3 & 12: Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const getBooksByAuthor = new Promise((resolve) => {
            let matchedBooks = [];
            let keys = Object.keys(books);
            keys.forEach(key => {
                if (books[key].author === author) {
                    matchedBooks.push(books[key]);
                }
            });
            resolve(matchedBooks);
        });

        const result = await getBooksByAuthor;
        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({message: "Author not found"});
        }
    } catch (error) {
        return res.status(500).json({message: "Error fetching data"});
    }
});

// Task 4 & 13: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const getBooksByTitle = new Promise((resolve) => {
            let matchedBooks = [];
            let keys = Object.keys(books);
            keys.forEach(key => {
                if (books[key].title === title) {
                    matchedBooks.push(books[key]);
                }
            });
            resolve(matchedBooks);
        });

        const result = await getBooksByTitle;
        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({message: "Title not found"});
        }
    } catch (error) {
        return res.status(500).json({message: "Error fetching data"});
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;