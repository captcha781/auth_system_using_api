// Environment Variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Specialized imports
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User")
const Subscription = require('./models/Subscription')
const MongoDBstore = require("connect-mongodb-session")(session);
const globalRoutes  =require("./routes/Global/Global")
// Global Middlewares
const store = new MongoDBstore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });
  
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Secret for our Analytics app by he LagCorp Team",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 60*60*24*28*1000,
        httpOnly: true,
    },
  })
);

// app.use((req,res,next) => {
  
//   console.log(req.ip)  
//   next()
// })

// Routes
app.use('/', globalRoutes)

// App Listener and DB Connector
mongoose.connect(process.env.MONGO_URI, (err) => {
  if (err) {
    console.log(err);
  }
  app.listen(process.env.LISTEN_PORT, () => {
    console.log("Server Runs in port " + process.env.LISTEN_PORT);
  });
});
