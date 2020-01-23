const express = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { findUserByEmail } = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); // This tells the Express app to use EJS as its templating engine

app.use(cookieSession({
  name: 'session',
  keys: ['spicy'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


///// DATABASES /////

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//////////////////////
///// FUNCTIONS /////
////////////////////

function generateRandomString(length) {
  let newStr = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    newStr += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return newStr;
}

//returns urls where the userID is equal to the id of the currently logged in user
function urlsForUser(id) {
  let urls = {};
  for (let obj of Object.keys(urlDatabase)) {
    if (urlDatabase[obj]['userID'] === id) {
      urls[obj] = urlDatabase[obj];
    }
  }
  return urls;
}
//returns hashed version of password
function passHash(password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return hashedPassword;
}

//////////////////////////
///// Express Logic /////
////////////////////////

app.post("/logout", (req, res) => {
  req.session = null; // clear cookies
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString(6);
  urlDatabase[newShortUrl] = { longURL: `http://www.${req.body.longURL}`, userID: req.session.user_id }; // add url to database
  // res.redirect("/urls/" + newShortUrl);
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.redirect("/urls");
  //res.send("WELCOME TO TINYAPP!");
});

app.listen(PORT, () => {
  console.log(`Quinton's TinyApp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  // if already logged in, go back to urls, show username
  if (req.session.user_id) {
    res.redirect("/urls");
  // no cookie, go log in
  } else {
    let templateVars = { user: undefined };
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  //check for valid input
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please enter an email and password');
  } else {
    //check if user exists
    let thisUser = findUserByEmail(req.body.email, users);
    if (!thisUser) {
      //if they don't exist already
      res.status(403).send('No Account Found! :(');
    } else {
      //if they exist already compare passwords
      if (bcrypt.compareSync(req.body.password, thisUser['password'])) {
        //set cookie
        req.session.user_id = thisUser['id'];
        res.redirect("/urls");
      } else {
        res.status(403).send('Incorrect Password! :(');
      }
    }
  }
});

app.get("/register", (req, res) => {
  // if cookie is set, display id
  if (req.session.user_id) {
    const userID = req.session.user_id;
    let templateVars = { user: users[userID] };
    res.render("registration", templateVars);
  // no cookie no display id
  } else {
    let templateVars = { user: undefined };
    res.render("registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  // check for valid input
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send('Please enter an email and password');
  } else {
    // check if user exists
    if (!findUserByEmail(req.body.email, users)) {
      // if they don't exist already
      let userRandomID = generateRandomString(6);
      // encrypt password
      let hash = bcrypt.hashSync(req.body.password, 10);
      // create new user object
      users[userRandomID] = {
        id: userRandomID,
        email: req.body.email,
        password: hash
      };
      // set cookie
      req.session.user_id = userRandomID;
    } else {
      // if they exist already
      res.status(400).send('An account with that email already exists!');
    }
  }
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// get urls corresponding to user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = { user: users[userID], urls: urlsForUser(userID) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //if already logged in let them go to page
  if (req.session.user_id) {
    const userID = req.session.user_id;
    let templateVars = { user: users[userID] };
    res.render("urls_new", templateVars);
  // not logged in get redirected
  } else {
    res.redirect("/urls");
  }
});

// get edit info for url
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = { user: users[userID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] };
  res.render("urls_show", templateVars);
});

// redirect to actual url web page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // if cookie is set and user_id matches database user can edit or delete
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  // if cookie is set and user_id matches database user can edit or delete
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    res.redirect("/urls/" + req.params.shortURL);
  } else {
    res.redirect("/login");
  }
});

// update url info and go back to index
app.post("/urls/:shortURL/update", (req, res) => {
  let longy = req.body.longURL;
  let shorty = req.params.shortURL;
  urlDatabase[shorty]['longURL'] = longy;
  res.redirect("/urls");
});