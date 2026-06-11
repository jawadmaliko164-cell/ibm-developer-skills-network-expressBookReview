const axios = require("axios");
const express = require("express");

const localBooks = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const baseURL =
  "https://adityakothar-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai";

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username or password was left empty",
    });
  }

  if (users[username]) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  users[username] = password;

  return res.status(201).json({
    message: "User registered successfully",
  });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/books`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/books`);
    const books = response.data;

    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/books`);
    const books = response.data;

    let result = {};

    for (let isbn in books) {
      if (books[isbn].author === req.params.author) {
        result[isbn] = books[isbn];
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/books`);
    const books = response.data;

    let result = {};

    for (let isbn in books) {
      if (books[isbn].title === req.params.title) {
        result[isbn] = books[isbn];
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book review
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!localBooks[isbn]) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  return res.status(200).json({
    reviews: localBooks[isbn].reviews,
  });
});

module.exports.general = public_users;
