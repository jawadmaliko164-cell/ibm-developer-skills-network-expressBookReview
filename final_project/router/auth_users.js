const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userWithSameName = users.filter((user) => {
    return user.username === username;
  });
  if (userWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  // Check fields are provided
  if (!username || !password) {
    return res.status(400).json({ message:"Username and password are required" })
  }

  // Check credentials are valid
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message:"Invalid credentials" })
  }

  // Sign a JWT and save it to the session
  let accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };

  res.status(200).json({ message:"Customer logged in succesfully" })

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  // Check if the book exist
  if (!books[isbn]) {
    return res.status(404).json({ message:"Book not found" })
  }

  // Add or overwrite the review under this username
  books[isbn].reviews[username] = review;

  res.status(200).json({ message:`Review for ISBN ${isbn} has been added/updated` })
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Check the book exist
  if (!books[isbn]) {
    return res.status(404).json({ message:"Book not found" })
  }

  // Check the user actually has a review to delete
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message:"No review found for this Customer" });
  }

  // Delete only this user's review
  delete books[isbn].reviews[username];

  res.status(200).json({ message:`Review by ${username} for ISBN ${isbn} has been deleted` })
})


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
