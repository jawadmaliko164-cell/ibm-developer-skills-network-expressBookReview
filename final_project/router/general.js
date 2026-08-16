const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Required for Task 11

// Task 6: Register
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Task 1: Get all books
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get by ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).send(books[isbn]);
});
  
// Task 3: Get by author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];
  for (let key in books) {
    if (books[key].author === author) {
      booksByAuthor.push(books[key]);
    }
  }
  return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
});

// Task 4: Get by title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];
  for (let key in books) {
    if (books[key].title === title) {
      booksByTitle.push(books[key]);
    }
  }
  return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
});

// Task 5: Get review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).send(books[isbn].reviews);
});

// --- TASK 11: AXIOS IMPLEMENTATION ---

// Method 1: Get all books using Promises
const getAllBooks = () => {
    axios.get('http://localhost:5000/')
        .then(response => console.log("All Books:", response.data))
        .catch(error => console.error(error));
};

// Method 2: Get book by ISBN using Promises
const getBookByISBN = (isbn) => {
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => console.log(`Book with ISBN ${isbn}:`, response.data))
        .catch(error => console.error(error));
};

// Method 3: Get books by Author using Async/Await
const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`Books by ${author}:`, response.data);
    } catch (error) {
        console.error(error);
    }
};

// Method 4: Get books by Title using Async/Await
const getBooksByTitle = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(`Book with title ${title}:`, response.data);
    } catch (error) {
        console.error(error);
    }
};

module.exports.general = public_users;
