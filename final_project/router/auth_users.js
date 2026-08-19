const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => user.username === username && user.password === password);
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
    return res.status(200).json({ message: "User logged in successfully.", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.user ? req.user.data : (req.session.authorization ? req.session.authorization.username : null);

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }
  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully." });
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  
  // Extrai o nome do usuário do token JWT (req.user) ou da sessão
  const username = req.user ? (req.user.username || req.user.data) : (req.session.authorization ? req.session.authorization.username : null);

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (books[isbn]) {
    let book = books[isbn];
    // Verifica se existe uma resenha publicada por este usuário
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username]; // Remove apenas a resenha do usuário logado
      return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
    } else {
      return res.status(404).json({ message: "No review found for this user to delete." });
    }
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
