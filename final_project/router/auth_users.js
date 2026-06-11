const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userwithsamename = users.filter((user) => {
        return user.hasOwnProperty(username);
    })

    if(userwithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users[username] === password; 
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password required"
        });
    }

    if (authenticatedUser(username, password)) {

        let accessToken = jwt.sign(
            { username: username },
            "access",
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).json({
            message: "User successfully logged in",
            token: accessToken
        });
    }

    return res.status(401).json({
        message: "Invalid username or password"
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization?.username;

  if(!username) {
    return res.status(403).json({ message: "User not logged in" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if(!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if(!books[isbn].review) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;

    if (!username) {
        return res.status(403).json({
            message: "User not logged in"
        });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Check if reviews exist for this book
    if (!books[isbn].reviews) {
        return res.status(404).json({
            message: "No reviews found for this book"
        });
    }

    // Check if user has a review
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review by user not found"
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
