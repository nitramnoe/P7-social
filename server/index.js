const express = require('express'),
  path = require('path'),
  mongoose = require('mongoose'),
  http = require('http'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  html = require('html'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  app = express(),
  bcrypt = require('bcrypt-nodejs'),
  User = require('./models/users');
  port = process.env.PORT || 8080;

mongoose.connect('mongodb://admin:admin@ds151127.mlab.com:51127/p7-social');

app.use(express.static(path.join(__dirname, '../client/build/')));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
  secret: 'keyboard cat',
  name: 'id',
  cookie: {
    maxAge: 60000,
    secure: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.post('/signin', (req, res) => {
  const activeUser = req.body.username;
  const activeUserPwd = req.body.password;

  User.find({
    username: activeUser
  }, (err, user) => {
    if (err)
      console.log(err);

    if (user.length > 0) {
      if (bcrypt.compareSync(activeUserPwd, user[0].password)) {
        console.log(req.session);
        res.send('Bien ouej');
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  });
})

// See all users
  .get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err)
      throw err;

    res.json(users);
  });
})

// User can register
  .post('/signup', (req, res) => {
  let newUser = new User({username: req.body.username, email: req.body.email, password: req.body.password});
  newUser.save(function(err) {
    if (err) {
      console.log('err', err);
      if (err.code == 11000)
        return res.json({success: false, message: "L'utilisateur existe déjà"});
      else
        return res.send(err);
      }
    res.json({message: "L'utilisateur est dans la place"});
  });
}).get('/auth/linkedin', (req, res) => {
  res.send('get token');
}).get('/auth/linkedin/callback', (req, res) => {
  res.send('token is ok');
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'));
}).listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log('Server is running on port ' + port);
});
