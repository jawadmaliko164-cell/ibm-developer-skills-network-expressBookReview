const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (!isValid(username)) {
    return res.status(409).json({message: "User already exists!"});
  }

  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author === author) {
      matchingBooks.push({isbn: isbn, ...books[isbn]});
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json({booksbyauthor: matchingBooks});
  } else {
    return res.status(404).json({message: "No books found for this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title === title) {
      matchingBooks.push({isbn: isbn, ...books[isbn]});
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json({booksbytitle: matchingBooks});
  } else {
    return res.status(404).json({message: "No books found for this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(200).json({message: "No reviews found for this book."});
    }
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

const BASE_URL = "http://localhost:5000";

// Task 10: Get the list of books available in the shop using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + '/', {proxy: false});
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error retrieving books"});
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(BASE_URL + '/isbn/' + isbn, {proxy: false})
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(404).json({message: "Book not found"}));
});

// Task 12: Get book details based on author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get(BASE_URL + '/author/' + encodeURIComponent(author), {proxy: false});
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({message: "No books found for this author"});
  }
});

// Task 13: Get book details based on title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get(BASE_URL + '/title/' + encodeURIComponent(title), {proxy: false});
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({message: "No books found for this title"});
  }
});

module.exports.general = public_users;
