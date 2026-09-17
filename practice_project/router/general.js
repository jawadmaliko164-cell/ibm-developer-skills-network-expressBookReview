const express = require("express");
const axios = require("axios");

const books = require("./booksdb");
const isValid = require("./auth_users").isValid;
const users = require("./auth_users").users;

const publicUsers = express.Router();

const BASE_URL = "http://localhost:5000";

// POST /register
publicUsers.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: "User registered successfully",
    username
  });
});

// GET /
// Task 1: get all books
// Uses async/await + Axios for Tasks 10-13.
publicUsers.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/_internal/books`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});

// GET /isbn/:isbn
// Task 2 + Task 11
publicUsers.get("/isbn/:isbn", async (req, res) => {
  try {
    const isbn = String(req.params.isbn);
    const response = await axios.get(`${BASE_URL}/_internal/books/isbn/${encodeURIComponent(isbn)}`);

    if (!response.data) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve book"
    });
  }
});

// GET /author/:author
// Task 3 + Task 12
publicUsers.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(
      `${BASE_URL}/_internal/books/author/${encodeURIComponent(author)}`
    );

    if (response.data.length === 0) {
      return res.status(404).json({
        message: "No books found for this author"
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});

// GET /title/:title
// Task 4 + Task 13
publicUsers.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(
      `${BASE_URL}/_internal/books/title/${encodeURIComponent(title)}`
    );

    if (response.data.length === 0) {
      return res.status(404).json({
        message: "No books found for this title"
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});

// GET /review/:isbn
// Task 5
publicUsers.get("/review/:isbn", (req, res) => {
  const isbn = String(req.params.isbn);
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (Object.keys(book.reviews).length === 0) {
    return res.status(200).json({
      message: "No reviews found for this book."
    });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = publicUsers;
