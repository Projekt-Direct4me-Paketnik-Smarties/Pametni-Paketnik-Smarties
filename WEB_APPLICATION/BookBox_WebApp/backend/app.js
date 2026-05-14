const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
var logger = require('morgan');
require("dotenv").config();

const PORT = process.env.PORT || 5000;
console.log(process.env.MONGO_URI)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB povezan");
    app.listen(PORT, () => {
      console.log(`Server teče na portu ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Napaka pri povezavi z MongoDB:", error);
  });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');
var bookRouter = require('./routes/bookRoutes');
var packetBoxRouter = require('./routes/packetBoxRoutes');
var borrowRouter = require('./routes/borrowRoutes');

var app = express();


var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'Our little secret',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
}));


app.use(cors({
  credentials: true,
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/images', express.static('public/images'));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', bookRouter);
app.use('/box', packetBoxRouter);
app.use('/borrow', borrowRouter);

// 404
app.use(function(req, res, next) {
  res.status(404).json({ message: "Not found" });
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json(err);
});

module.exports = app;