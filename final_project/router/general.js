const express = require('express');
let books = require("./booksdb.js");  //The books are there
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//importa el módulo axios, que se utiliza para realizar solicitudes HTTP.
const axios = require('axios').default;


public_users.post("/register", (req,res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  //Write the authenication mechanism here
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  //Send a JSON response containing the users array, formatted with an indentation of 4 spaces for readability
  res.send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  //Con un email especifico sin utilizar filtro
  //res.send(friends[req.params.email]);
  // Retrieve the email parameter from the request URL and send the corresponding friend's details
  //const isbn = req.params.isbn;
  //res.send({books}[isbn]);
  res.send(books[req.params.isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  // const author = req.params.author;
  // let filtered_books = books.filter((book) => book.author === author);
  // res.send(filtered_books);

  //Obtenga todas las claves para el objeto "libros"
  let keys = Object.keys(books);
  //Recorra la matriz "libros" y verifique que el autor coincida con el proporcionado en los parámetros de la solicitud.
  let filtered_books = [];
  keys.forEach((key) => {
    if (books[key].author === req.params.author) {
      filtered_books.push(books[key]);
    }
  });
  res.send(filtered_books);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  //Complete el código para obtener los detalles del libro según el título a continuación
  //Obtenga todas las claves para el objeto "libros"
  let keys = Object.keys(books);
  //Recorra la matriz "libros" y verifique que el titulo coincida con el proporcionado en los parámetros de la solicitud.
  let filtered_books = [];
  keys.forEach((key) => {
    if (books[key].title === req.params.title) {
      filtered_books.push(books[key]);
    }
  });
  res.send(filtered_books);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  //Complete el código para obtener reseñas de libros
  //Sugerencia: Obtenga las reseñas de libros según el ISBN proporcionado en los parámetros de solicitud.
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);

});

// Función que utiliza Axios para hacer una solicitud GET
const connectToURL = async (url) => {
  try {
    const response = await axios.get(url);
    console.log(response.data); // Muestra la lista de libros en la consola
  } catch (error) {
    console.error(error);
  }
};

// Llama a la función para conectarse a la ruta '/' y obtener la lista de libros
connectToURL('http://localhost:5000/');

const getBookWithISBN = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log(response.data); // Muestra los detalles del libro en la consola
  } catch (error) {
    console.error(error);
  }
};

//Ahora acá llamo a la funcion
getBookWithISBN('1');

//Agregue el código para obtener los detalles del libro según el autor (hecho en la tarea 3) usando devoluciones de llamadas Promise o async-await con Axios.
//Sugerencia: consulte este laboratorio sobre promesas y devoluciones de llamadas.
const getDetailsOfBookforAuthor = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    console.log(response.data); // Muestra los detalles del libro en la consola
  } catch (error) {
    console.error(error);
  }
}

//Ahora acá llamo a la funcion
getDetailsOfBookforAuthor('Samuel Beckett');

//Agregue el código para obtener los detalles del libro según el título (realizado en la tarea 4) mediante devoluciones de llamadas de Promise o async-await con Axios.
//Sugerencia: consulte este laboratorio sobre promesas y devoluciones de llamadas.

const getDetailsOfBookforTitle = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    console.log(response.data); // Muestra los detalles del libro en la consola
  } catch (error) {
    console.error(error);
  }
}

//Ahora acá llamo a la funcion
getDetailsOfBookforTitle('The Divine Comedy');

module.exports.general = public_users;
