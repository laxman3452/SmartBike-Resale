var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

require('dotenv').config();
const cors = require('cors');





mongoose.connect(process.env.mongo).then(() => console.log('DB connected'));



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Allow CORS from all origins
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', (req,res,next)=>{
//   res.status(200).json({message:'This is the index.'});
//   next();
// });
app.get('/', (req, res) => {
  res.send('Welcome to smartBike-Resale API');
});
app.use('/api/v1', require('./routes/authRoutes'));
app.use('/api/v1/bike', require('./routes/bikeRoutes'));
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/email', require('./routes/emailRoutes'));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Server Error:', err.stack || err.message);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

module.exports = app;
