const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// ── Register a new user ───────────────────────────────────────────────────────
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// ── Task 10: Get all books using async/await with Promise ─────────────────────
public_users.get('/', async function (req, res) {
  try {
    const getAllBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject(new Error("Books data not available"));
        }
      });
    };

    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ── Task 11: Get book by ISBN using Promise callbacks ─────────────────────────
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found"));
      }
    });
  };

  getBookByISBN(isbn)
    .then(book => {
      return res.status(200).json(book);
    })
    .catch(err => {
      return res.status(404).json({ message: err.message });
    });
});

// ── Task 12: Get books by author using async/await ────────────────────────────
public_users.get('/author/:author', async function (req, res) {
  try {
    const getBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        const result = {};
        for (const isbn in books) {
          if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
            result[isbn] = books[isbn];
          }
        }
        if (Object.keys(result).length > 0) {
          resolve(result);
        } else {
          reject(new Error("No books found by this author"));
        }
      });
    };

    const author = req.params.author;
    const booksByAuthor = await getBooksByAuthor(author);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ── Task 13: Get books by title using async/await ─────────────────────────────
public_users.get('/title/:title', async function (req, res) {
  try {
    const getBooksByTitle = (title) => {
      return new Promise((resolve, reject) => {
        const result = {};
        for (const isbn in books) {
          if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
            result[isbn] = books[isbn];
          }
        }
        if (Object.keys(result).length > 0) {
          resolve(result);
        } else {
          reject(new Error("No books found with this title"));
        }
      });
    };

    const title = req.params.title;
    const booksByTitle = await getBooksByTitle(title);
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ── Get book reviews by ISBN ───────────────────────────────────────────────────
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;