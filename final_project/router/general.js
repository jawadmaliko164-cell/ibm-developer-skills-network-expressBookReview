const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    //Write your code here
    let {username, password} = req.body;

    if(!isValid(username)) {
        users.push({
            "username" : username,
            "password" : password
        })
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
    }else{
        return res.status(404).json({ message: "User already exists!" });
    }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    //Write your code here
    return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    //Write your code here
    let ISBN = req.params.isbn;
    if (ISBN) {
        res.send(books[ISBN]);
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    //Write your code here
    let author = Object.values(books).filter((book) => {
        return book.author === req.params.author;
    });
    
    if(author.length > 0) {
        res.send(author[0]);
    }

});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    //Write your code here
    let author = Object.values(books).filter((book) => {
        return book.title === req.params.title;
    });
    
    if(author.length > 0) {
        res.send(author[0]);
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here
    let author = Object.values(books).filter((book) => {
        return book.ISBN === req.params.ISBN;
    });
    if(author.length > 0) {
        res.send(author[0].reviews);
    }
    
});

module.exports.general = public_users;
