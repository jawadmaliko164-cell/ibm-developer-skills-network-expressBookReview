const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

//Esto es posible que no deba estar
//let users = []

const app = express();

app.use(express.json());

// Middleware de sesión para todas las rutas de /customer
app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// SIGN-UP
// Check if a user with the given username already exists
// const doesExist = (username) => {
//     // Filter the users array for any user with the same username
//     let userswithsamename = users.filter((user) => {
//         return user.username === username;
//     });
//     // Return true if any user with the same username is found, otherwise false
//     if (userswithsamename.length > 0) {
//         return true;
//     } else {
//         return false;
//     }
// }

// Rutas que no requieren autenticación (como login y registro), pero deben tener como primera opción /customer
app.use("/customer", customer_routes);

// Aplicar autenticación a rutas que la requieran (por ejemplo, después de login)
app.use("/customer/auth/*", function auth(req,res,next){
    // //Write the authenication mechanism here
    // const username = req.body.username;
    // const password = req.body.password;

    // // Check if both username and password are provided
    // if (username && password) {
    //     // Check if the user does not already exist
    //     if (!doesExist(username)) {
    //         // Add the new user to the users array
    //         users.push({"username": username, "password": password});
    //         return res.status(200).json({message: "User successfully registered. Now you can login"});
    //     } else {
    //         return res.status(404).json({message: "User already exists!"});
    //     }
    // }
    // // Return error if username or password is missing
    // return res.status(404).json({message: "Unable to register user."});

    if (req.session.authorization) {
        next(); // Si está autenticado, continuar con la solicitud
    } else {
        res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5000;

//Rutas generales
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
