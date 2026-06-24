const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (isValid(username)) {

        users.push({
            username,
            password
        });

        return res.status(200).json({
            message: "User successfully registered."
        });

    }

    return res.status(409).json({
        message: "Username already exists."
    });

});

// Internal route to return the book list directly
public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop using Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch book list' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbnNo = req.params.isbn;

  try {
    const response = await axios.get('http://localhost:5000/books');
    const book = response.data[isbnNo];

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch book details.' });
  }
});

public_users.get('/books/isbn/:isbn', async function (req, res) {
  const isbnNo = req.params.isbn;

  try {
    const response = await axios.get('http://localhost:5000/books');
    const book = response.data[isbnNo];

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch book details.' });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author;
    const result = {};

    Object.keys(books).forEach((key) => {
        if (books[key].author === authorName) {
            result[key] = books[key];
        }
    });

    res.json(result);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const titleName = req.params.title;
  const result = {};

  Object.keys(books).forEach((key) => {
    if (books[key].title === titleName) {
      result[key] = books[key];
    }
  });

  res.json(result);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbnNo = req.params.isbn;
  const book = books[isbnNo];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  const reviews = book.reviews;

  if (!reviews || Object.keys(reviews).length === 0) {
    return res.json({ message: "No reviews found for this book." });
  }

  return res.json(reviews);
});

module.exports.general = public_users;
