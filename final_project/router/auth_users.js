const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Loop through users to find matching username and password
  for(let i = 0; i < users.length; i++) {
    if(users[i].username === username && users[i].password === password) {
      return true;
    }
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  // Get username and password from request body
  let username = req.body.username;
  let password = req.body.password;
  
  // Check if user is authenticated
  if(authenticatedUser(username, password)) {
    // Create a JWT token with username
    let accessToken = jwt.sign({
      data: password,
      username: username
    }, 'fingerprint_customer', { expiresIn: 60 * 60 });
    
    // Save the token to session
    req.session.authorization = {
      accessToken, username
    }
    
    // Return the access token
    return res.status(200).json({message: "User logged in successfully", token: accessToken});
  } else {
    // Return error if authentication fails
    return res.status(400).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from request parameters
  let isbn = req.params.isbn;
  
  // Convert ISBN to number since books keys are numbers
  isbn = Number(isbn);
  
  // Get the review from request query
  let review = req.query.review;
  
  // Get the username from decoded token (set by middleware) or session
  let username;
  if(req.user && req.user.username) {
    username = req.user.username;
  } else if(req.session.authorization && req.session.authorization.username) {
    username = req.session.authorization.username;
  } else {
    return res.status(403).json({message: "User not authenticated"});
  }
  
  // Check if the book exists
  if(books[isbn]) {
    // Check if this user already has a review for this book
    if(books[isbn].reviews[username]) {
      // Update the existing review
      books[isbn].reviews[username] = review;
      return res.status(200).json({message: "Review updated successfully"});
    } else {
      // Add a new review
      books[isbn].reviews[username] = review;
      return res.status(200).json({message: "Review added successfully"});
    }
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from request parameters
  let isbn = req.params.isbn;
  
  // Convert ISBN to number since books keys are numbers
  isbn = Number(isbn);
  
  // Get the username from decoded token (set by middleware) or session
  let username;
  if(req.user && req.user.username) {
    username = req.user.username;
  } else if(req.session.authorization && req.session.authorization.username) {
    username = req.session.authorization.username;
  } else {
    return res.status(403).json({message: "User not authenticated"});
  }
  
  // Check if the book exists
  if(books[isbn]) {
    // Check if this user has a review for this book
    if(books[isbn].reviews[username]) {
      // Delete the review
      delete books[isbn].reviews[username];
      return res.status(200).json({message: "Review deleted successfully"});
    } else {
      // Return error if review not found
      return res.status(404).json({message: "Review not found"});
    }
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
