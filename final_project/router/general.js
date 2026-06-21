const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
const public_users = express.Router();

const users = [];

const isValid = (username) => {
  if (!username || typeof username !== 'string') {
    return false;
  }
  return users.some((user) => user.username === username);
};

const getBooksDataUrl = (req) => {
  const host = req.get('host') || `localhost:${process.env.PORT || 5000}`;
  return `${req.protocol}://${host}/data/books`;
};

const fetchBooks = async (req) => {
  try {
    const response = await axios.get(getBooksDataUrl(req), {
      timeout: 5000
    });

    if (!response || typeof response.data !== 'object') {
      throw new Error('Invalid response from book data source.');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText || 'Book service returned an error.';
      throw new Error(message);
    }
    if (error.request) {
      throw new Error('Unable to reach book data source.');
    }
    throw new Error(error.message);
  }
};

public_users.get('/data/books', (req, res) => {
  return res.status(200).json(books);
});

// ─── Part D: POST /register ───────────────────────────────────────────────────
// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: `Username '${username}' already exists. Please choose another.`
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: `User '${username}' registered successfully. You can now login.`
  });
});

// ─── Part D & E: GET / ─ Get all books ─────────────────────────────────────────
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await fetchBooks(req);

    return res.status(200).json({
      message: "All books retrieved successfully.",
      total: Object.keys(allBooks).length,
      books: allBooks
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── Part D & E: GET /isbn/:isbn ─ Get book by ISBN ─────────────────────────────
public_users.get('/isbn/:isbn', async function (req, res) {
  const { isbn } = req.params;

  try {
    const allBooks = await fetchBooks(req);
    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    return res.status(200).json({ isbn, book });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── Part D & E: GET /author/:author ─ Get books by author ─────────────────────
public_users.get('/author/:author', async function (req, res) {
  const searchAuthor = req.params.author.toLowerCase();

  try {
    const allBooks = await fetchBooks(req);
    const matchedBooks = Object.fromEntries(
      Object.entries(allBooks).filter(([, book]) =>
        book.author.toLowerCase().includes(searchAuthor)
      )
    );

    if (Object.keys(matchedBooks).length === 0) {
      return res.status(404).json({ message: `No books found for author: ${req.params.author}` });
    }

    return res.status(200).json({
      message: `Books by '${req.params.author}' retrieved successfully.`,
      books: matchedBooks
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── Part D & E: GET /title/:title ─ Get books by title ────────────────────────
public_users.get('/title/:title', async function (req, res) {
  const searchTitle = req.params.title.toLowerCase();

  try {
    const allBooks = await fetchBooks(req);
    const matchedBooks = Object.fromEntries(
      Object.entries(allBooks).filter(([, book]) =>
        book.title.toLowerCase().includes(searchTitle)
      )
    );

    if (Object.keys(matchedBooks).length === 0) {
      return res.status(404).json({ message: `No books found with title: ${req.params.title}` });
    }

    return res.status(200).json({
      message: `Books with title '${req.params.title}' retrieved successfully.`,
      books: matchedBooks
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ─── Part D: GET /review/:isbn ─ Get book reviews ────────────────────────────
public_users.get('/review/:isbn', async function (req, res) {
  const { isbn } = req.params;

  try {
    const allBooks = await fetchBooks(req);
    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    const reviewCount = Object.keys(book.reviews).length;

    if (reviewCount === 0) {
      return res.status(200).json({ message: "No reviews found for this book." });
    }

    return res.status(200).json({
      isbn,
      title: book.title,
      author: book.author,
      reviewCount,
      reviews: book.reviews
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.general = public_users;
module.exports.users = users;
