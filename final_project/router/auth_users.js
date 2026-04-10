const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];


// ✅ check if username already exists
const isValid = (username) => {
  return !users.some(user => user.username === username);
};


// ✅ check username + password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};


// ✅ TASK 7: LOGIN
regd_users.post("/login", (req, res) => {

  const { username, password } = req.body;

  // check missing fields
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password required"
    });
  }

  // check valid user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid login"
    });
  }

  // generate token
  const accessToken = jwt.sign(
    { username: username },
    "secretKey",
    { expiresIn: "1h" }
  );

  // store in session
  req.session.authorization = {
    accessToken
  };

  return res.status(200).json({
    message: "Login successful",
    token: accessToken
  });
});


// ✅ TASK 8: ADD / MODIFY REVIEW
regd_users.put("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  // add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});


// ✅ TASK 9: DELETE REVIEW
regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: "No review by this user"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;