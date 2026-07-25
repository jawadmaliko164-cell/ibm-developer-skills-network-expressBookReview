const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
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

//only registered users can login, the endpoint is "/login"
regd_users.post("/login", (req,res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
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
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});

  // Obtener el ISBN del libro de los parámetros
  const isbn = req.params.isbn;
  
  // Obtener el nombre de usuario de la sesión
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Obtener la nueva reseña del cuerpo de la solicitud
  const { review } = req.body;

  // Verificar si el libro existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Inicializar el objeto de reseñas si no existe
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Verificar si el usuario ya tiene una reseña para este libro
  if (books[isbn].reviews[username]) {
    // Modificar la reseña existente
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  } else {
    // Agregar una nueva reseña para el usuario
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added successfully" });
  }

  
});

regd_users.delete("/auth/review/:isbn", (req, res) =>{
  //Complete el código para eliminar una reseña de un libro
  //Sugerencia: filtre y elimine las reseñas según el nombre de usuario de la sesión, para que un usuario pueda eliminar solo sus reseñas y no las de otros usuarios.

  // Obtener el ISBN del libro de los parámetros
  const isbn = req.params.isbn;
  
  // Obtener el nombre de usuario de la sesión
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Verificar si el libro existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Verificar si el usuario tiene una reseña para este libro
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Eliminar la reseña del usuario
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
