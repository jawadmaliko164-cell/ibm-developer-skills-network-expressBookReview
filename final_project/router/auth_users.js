const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let sameUsername = users.filter((user) =>{
    return user.username === username;
  });

  if(sameUsername.length > 0){
    return true;

  }
  else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
   // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
            // Generate JWT access token
            let accessToken = jwt.sign({
                data: password
            }, 'access', { expiresIn: 60 * 60 });
    
            // Store access token and username in session
            req.session.authorization = {
                accessToken, username
            }
            return res.status(200).send("User successfully logged in");
      } else {
            return res.status(208).json({ message: "Invalid Login. Check username and password" });
        }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; //getting isbn
  const review = req.query.review; // gettting review from body 
  const username = req.session.authorization.username; //getting username form session

  if(!review){
    return res.status(400).json({message: "Review required"})
  }

  books[isbn].reviews[username] = review;
  return res.status(200).send(`Review added by user: ${username}`)

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username; 
  const isbn = req.params.isbn;

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if reviews exist
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  // Check if this user has a review
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "You have not reviewed this book" });
  }

  // Delete ONLY this user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Your review has been deleted successfully" });



});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
