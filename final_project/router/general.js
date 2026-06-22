const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
      return res.status(400).json({
          message: "Username and password are required"
      });
  }

  // Check if username already exists
  if (!isValid(username)) {
      users.push({
          username: username,
          password: password
      });

      return res.status(200).json({
          message: "User successfully registered. Now you can login."
      });
  }

  return res.status(409).json({
      message: "Username already exists!"
  });
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null,4));
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbnNo = req.params.isbn;
  res.send(books[isbnNo]);
//   return res.status(300).json({message: "Yet to be implemented"});
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
