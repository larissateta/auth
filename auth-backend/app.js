const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./db/userModel')
const auth = require("./auth")
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnection")

// dbConnection

dbConnect();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

app.post("/register", async (req, res)=>{
  try{
    const hashedPassword= await bcrypt.hash(req.body.password, 10);

    const user= new User({
      email:req.body.email,
      password: hashedPassword
    });

    const result = await user.save();

    res.status(201).send({
      message:"User created successfully",
      result
    });
  }catch( err){
    console.error(err);
    res.status(500).send({
      message:"Password failed to hash",
      error: err.message
    });
  }
})

app.post('/login', (req, res)=>{
  User.findOne({email:req.body.email})
  .then((user)=>{
    bcrypt.compare(req.body.password, user.password)
    .then((passwordCheck)=>{
      if(!passwordCheck){
        return res.status(400).send({
          message: "Password do not match",
          // error
        })
      }

      const token = jwt.sign(
        {
          userId: user._id,
          userEmail: user.email
        },
        "RANDOM_TOKEN",
        {expiresIn: "24h"}
      );

      res.status(200).send({
        message: "Login successfully",
        email: user.email,
        token
      })
    }).catch((error)=>{
      res.status(400).send({
        message: "Passwords do not match",
        error
      })
    })
  })
  .catch((e)=>{
    res.status(404).send({
      message: "Email not found!",
      e
    })
  })
})

  // free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

  // authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});


module.exports = app;
