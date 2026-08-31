const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        username:"user_1",
        password:"passw_1",
        firstName: "John",
        lastName: "wick",
        email:"johnwick@gmail.com",
        DOB:"22-01-1990",
    },
    {
        username:"user_2",
        password:"passw_2",
        firstName: "John",
        lastName: "smith",
        email:"johnsmith@gmail.com",
        DOB:"21-07-1983",
    },
    {
        username:"user_3",
        password:"passw_3",
        firstName: "Joyal",
        lastName: "white",
        email:"joyalwhite@gmsil.com",
        DOB:"21-03-1989",
    },
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some(u => u.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Username and password are required" });
  }
 
  if (!authenticatedUser(username, password)) { 
    return res.status(403).json({ message: "Invalid username or password" });
  }

  let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = { accessToken };
  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

   const isbn = req.params.isbn;
   const review = req.query.review;  
   const username = req.user.data;  


  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  const book = Object.values(books).find(b => b.isbn == isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;

  return res.status(200).json({ 
    message: "Review added/updated successfully",
    reviews: book.reviews 
  });

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Copy the code here
    
    const username = req.user.data;
    const isbn = req.params.isbn;
    const book = Object.values(books).find(b => b.isbn == isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }


   delete book.reviews[username];

  return res.status(200).json({ 
    message: "Review deleted successfully",
    reviews: book.reviews 
  });
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
