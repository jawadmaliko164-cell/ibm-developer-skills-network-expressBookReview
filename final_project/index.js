const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const users = require('./router/auth_users.js').users;
const genl_routes = require('./router/general.js').general;


const app = express();
const PORT = 5000;
app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken']; 
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; 
                next(); 
            } else {
                return res.status(403).json({ message: "User not authenticated" }); // Return error if token verification fails
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);


app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(404).json({ message: "Username and password are required" });
    }
  
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(403).json({ message: "Invalid username or password" });
    }
  
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
  
    req.session.authorization = { accessToken };
    return res.status(200).json({ message: "User successfully logged in" });
});
app.listen(PORT, () => console.log("Server is running at port " + PORT));