const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const handlebars = require('handlebars')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const http = require('http');
const url = require('url');
const flash = require('connect-flash');
const Session_store = require('connect-mongodb-session')(session);
const socketio = require('socket.io');

// Handlebars property to allow prototype access
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

// Require non-constant packages
require('dotenv').config();
require('./public/js/passport').Initialize(passport);

// Require local js files
const AppUtil = require('./public/js/app-util');

// Define app using express and create server
// Initialize socket.io
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Define constant variables
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((error) => console.log(error));

// Create view using Handlebars
// Define default layout, layout directory, views directory and Handlebars helper
app.engine('handlebars', exphbs({
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  handlebars: allowInsecurePrototypeAccess(handlebars)
}));

// Setting up MongoDB session store
const store = new Session_store({
  uri: process.env.MONGO_URI,
  collection: 'usersessions'
});

// Catches session store error
store.on('error', function (error) {
  console.log(error);
});

// Setting up express session
app.use(session({
  secret: 'secret',
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  store: store,
  resave: true,
  saveUninitialized: true
}));

// Setting up connect flash
app.use(flash());

// Setting up passport
app.use(passport.initialize());
app.use(passport.session());

// Setting up body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting up environment
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

// Setting up global variables
app.use(function (req, res, next) {
  res.locals.auth_error = req.flash('error');
  res.locals.success_alert = req.flash('success_alert');
  res.locals.error_alert = req.flash('error_alert');
  next();
});

// Include routes
app.use('/', require('./routes/index')(io));
app.use('/user', require('./routes/user')(io));
app.use('/island', require('./routes/island')(io));

// Setting up 404 page
app.use(function (req, res) {
  res.status(404).render('404');
});

// Add port for app
server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});