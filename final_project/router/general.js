const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Get username and password from request body
  let username = req.body.username;
  let password = req.body.password;
  
  // Check if username or password is missing
  if(!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Check if username already exists
  let userExists = false;
  for(let i = 0; i < users.length; i++) {
    if(users[i].username === username) {
      userExists = true;
      break;
    }
  }
  
  // If user exists, return error
  if(userExists) {
    return res.status(400).json({message: "Username already exists"});
  }
  
  // Add new user to users array
  users.push({username: username, password: password});
  
  // Return success message
  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Return all books in the shop
  return res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Get the ISBN from the request parameters
  let isbn = req.params.isbn;
  
  // Convert ISBN to number since books keys are numbers
  isbn = Number(isbn);
  
  // Check if the book exists
  if(books[isbn]) {
    // Return the book details
    return res.send(books[isbn]);
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Get the author from request parameters
  let author = req.params.author;
  
  // Create an empty array to store matching books
  let matchingBooks = [];
  
  // Get all the book keys
  let bookKeys = Object.keys(books);
  
  // Loop through each book to check the author
  for(let i = 0; i < bookKeys.length; i++) {
    let key = bookKeys[i];
    let book = books[key];
    
    // Check if the author matches
    if(book.author === author) {
      // Add the book to the matching books array
      matchingBooks.push(book);
    }
  }
  
  // Return the matching books
  return res.send(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Get the title from request parameters
  let title = req.params.title;
  
  // Create an empty array to store matching books
  let matchingBooks = [];
  
  // Get all the book keys
  let bookKeys = Object.keys(books);
  
  // Loop through each book to check the title
  for(let i = 0; i < bookKeys.length; i++) {
    let key = bookKeys[i];
    let book = books[key];
    
    // Check if the title matches
    if(book.title === title) {
      // Add the book to the matching books array
      matchingBooks.push(book);
    }
  }
  
  // Return the matching books
  return res.send(matchingBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Get the ISBN from request parameters
  let isbn = req.params.isbn;
  
  // Convert ISBN to number since books keys are numbers
  isbn = Number(isbn);
  
  // Check if the book exists
  if(books[isbn]) {
    // Return the reviews for this book
    return res.send(books[isbn].reviews);
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
});

// Task 10: Get all books using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    // Use Axios to get all books from the synchronous endpoint
    let response = await axios.get('http://localhost:5000/');
    // Return the books data
    return res.send(response.data);
  } catch (error) {
    // Return error if request fails
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Task 11: Get book by ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    // Get the ISBN from request parameters
    let isbn = req.params.isbn;
    // Use Axios to get book by ISBN from the synchronous endpoint
    let response = await axios.get('http://localhost:5000/isbn/' + isbn);
    // Return the book data
    return res.send(response.data);
  } catch (error) {
    // Return error if book not found or request fails
    if(error.response && error.response.status === 404) {
      return res.status(404).json({message: "Book not found"});
    }
    return res.status(500).json({message: "Error fetching book"});
  }
});

// Task 12: Get books by author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    // Get the author from request parameters
    let author = req.params.author;
    // Use Axios to get books by author from the synchronous endpoint
    let response = await axios.get('http://localhost:5000/author/' + author);
    // Return the matching books data
    return res.send(response.data);
  } catch (error) {
    // Return error if request fails
    return res.status(500).json({message: "Error fetching books by author"});
  }
});

// Task 13: Get books by title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  try {
    // Get the title from request parameters
    let title = req.params.title;
    // Use Axios to get books by title from the synchronous endpoint
    let response = await axios.get('http://localhost:5000/title/' + title);
    // Return the matching books data
    return res.send(response.data);
  } catch (error) {
    // Return error if request fails
    return res.status(500).json({message: "Error fetching books by title"});
  }
});

module.exports.general = public_users;
