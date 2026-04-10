const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();


// ✅ TASK 6: Register
public_users.post("/register", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password required"
    });
  }

  if (!isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: "User registered successfully"
  });
});


// ✅ TASK 1: Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});


// ✅ TASK 2: Get by ISBN
public_users.get('/isbn/:isbn', (req, res) => {

  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
});


// ✅ TASK 3: Get by author
public_users.get('/author/:author', (req, res) => {

  const author = req.params.author;
  let result = [];

  for (let key in books) {
    if (books[key].author === author) {
      result.push(books[key]);
    }
  }

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found" });
  }

  return res.status(200).json(result);
});


// ✅ TASK 4: Get by title
public_users.get('/title/:title', (req, res) => {

  const title = req.params.title;
  let result = [];

  for (let key in books) {
    if (books[key].title === title) {
      result.push(books[key]);
    }
  }

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found" });
  }

  return res.status(200).json(result);
});


// ✅ TASK 5: Get reviews
public_users.get('/review/:isbn', (req, res) => {

  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});


// =======================
// 🔥 ASYNC TASKS (10–13)
// =======================


// ✅ TASK 10: Async get all books
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch {
    return res.status(500).json({ message: "Error fetching books" });
  }
});


// ✅ TASK 11: Promise get by ISBN
public_users.get('/async/isbn/:isbn', (req, res) => {

  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(() => {
      return res.status(404).json({ message: "Book not found" });
    });
});


// ✅ TASK 12: Async get by author
public_users.get('/async/author/:author', async (req, res) => {

  const author = req.params.author;

  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);
  } catch {
    return res.status(404).json({ message: "No books found" });
  }
});


// ✅ TASK 13: Promise get by title
public_users.get('/async/title/:title', (req, res) => {

  const title = req.params.title;

  axios.get(`http://localhost:5000/title/${title}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(() => {
      return res.status(404).json({ message: "No books found" });
    });
});


module.exports.general = public_users;