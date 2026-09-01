const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some((user) => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. You can now login" });
});


public_users.get('/', async function (req, res) {
    try {
        const getBooks = new Promise((resolve) => {
            resolve(books);
        });

        const booksList = await getBooks;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(500).json({ message: "Go somewhere else", error: error.message });
    }
});


public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const getBook = new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Go somewhere else!"));
            }
        });

        const book = await getBook;
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});
  

public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = [];

            bookKeys.forEach((key) => {
                if (books[key].author.toLowerCase() === author.toLowerCase()) {
                    matchingBooks.push({
                        isbn: key,
                        title: books[key].title,
                        reviews: books[key].reviews
                    });
                }
            });

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error("No books found for this author"));
            }
        });

        const booksList = await getBooksByAuthor;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});



public_users.get('/title/:title', async function (req, res) {
    const requestedTitle = req.params.title;

    try {
        const getBooksByTitle = new Promise((resolve, reject) => {
            const matchingBooks = [];
            const keys = Object.keys(books);

            keys.forEach((isbn) => {
                let book = books[isbn];
                if (book.title.toLowerCase() === requestedTitle.toLowerCase()) {
                    matchingBooks.push(book);
                }
            });

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error("No book found with this title"));
            }
        });

        const booksList = await getBooksByTitle;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
