const express = require("express");
const jwt = require("jsonwebtoken");

const books = require("./booksdb");

const regdUsers = express.Router();
const users = [];

const JWT_SECRET = process.env.JWT_SECRET || "book-review-jwt-secret";

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// POST /customer/login
regdUsers.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const accessToken = jwt.sign(
    { username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "Login successful",
    username,
    accessToken
  });
});

// PUT /customer/auth/review/:isbn
regdUsers.put("/auth/review/:isbn", (req, res) => {
  const isbn = String(req.params.isbn);
  const { review } = req.body || {};
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!review || typeof review !== "string" || !review.trim()) {
    return res.status(400).json({
      message: "Review is required"
    });
  }

  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: "Review added/updated successfully",
    isbn,
    username,
    review: books[isbn].reviews[username]
  });
});

// DELETE /customer/auth/review/:isbn
regdUsers.delete("/auth/review/:isbn", (req, res) => {
  const isbn = String(req.params.isbn);
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({
      message: "Review not found for this user"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully"
  });
});

module.exports.authenticated = regdUsers;
module.exports.isValid = isValid;
module.exports.users = users;
