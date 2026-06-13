// auth_users.js

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

// Check if username is valid
const isValid = (username) => {
  return username && username.length >= 3 && /^[a-zA-Z0-9]+$/.test(username);
};

// Check if user exists
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password required"
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { username: username },
    "secret_key",
    { expiresIn: "1h" }
  );

  // Store token in session
  req.session.authorization = {
    accessToken: token
  };

  return res.status(200).json({
    message: "Login successful",
    token: token
  });
});

// Add or modify review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = "testuser";

  if (!review) {
    return res.status(400).json({
      message: "Review cannot be empty"
    });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  // Add/update review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews
  });
});

// Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const username = "testuser";

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully"
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;