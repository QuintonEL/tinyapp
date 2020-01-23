const express = require("express");
const app = express();
var cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

app.set("view engine", "ejs"); // This tells the Express app to use EJS as its templating engine

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
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(length) {
  let newStr = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    newStr += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return newStr;
}

function findUserByEmail(email) {
  for (const user of Object.values(users)) {
    if (user['email'] === email) {
      return user;
    }
  }
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
//console.log(urlsForUser('aJ48lW'))

function passHash(password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return hashedPassword;
}

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString(6);
  urlDatabase[newShortUrl] = { longURL: `http://www.${req.body.longURL}`, userID: req.cookies['user_id'] };
  res.redirect("/urls/" + newShortUrl);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  // if cookie is set display logged in as
  // if already logged in, go back to urls
  if (req.cookies['user_id']) {
    res.redirect("/urls");
  } else { // no cookie log in
    let templateVars = { user: undefined }
    res.render("login", templateVars);
  }
})

app.post("/login", (req, res) => {
  //check for valid input
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please enter an email and password');
  } else {
    //check if user exists
    let thisUser = findUserByEmail(req.body.email);
    if (!thisUser) {
      //if they don't exist already
      res.status(403).send('No Account Found!');
    } else {
      //if they exist already
      //compare passwords
      if(bcrypt.compareSync(req.body.password, thisUser['password'])) {
        //set user_id cookie
        res.cookie('user_id', thisUser['id']);
        res.redirect("/urls");
      } else {
        res.status(403).send('Incorrect Password');
      }
    }
  }
});

app.get("/register", (req, res) => {
  // if cookie is set display id
  if (req.cookies['user_id']) {
    const userID = req.cookies['user_id'];
    let templateVars = { user: users[userID] };
    res.render("registration", templateVars);
  } else { // no cookie no display id
    let templateVars = { user: undefined }
    res.render("registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  //check for valid input
  console.log(users)
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send('Please enter an email and password')
  } else {
    //check if user exists
    if (!findUserByEmail(req.body.email)) {
      //if they don't exist already
      let userRandomID = generateRandomString(6);
      let hash = bcrypt.hashSync(req.body.password, 10);
      users[userRandomID] = {
        id: userRandomID, 
        email: req.body.email, 
        password: hash
      };
      res.cookie('user_id', userRandomID)
    } else {
      //if they exist already
      res.status(400).send('An account with that email already exists!')
    }
  }
  console.log(users)
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  console.log(urlsForUser(userID))
  let templateVars = { user: users[userID], urls: urlsForUser(userID) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //if already logged in let them go to page
  if (req.cookies['user_id']) {
    const userID = req.cookies['user_id'];
    let templateVars = { user: users[userID] };
    res.render("urls_new", templateVars);
  } else { // not logged in get redirected
    res.redirect("/urls");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id'];
  let templateVars = { user: users[userID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // Users Can Only Edit or Delete Their Own URLs
  // if cookie is set and user_id matches database
  if(req.cookies['user_id'] && req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
    // Users Can Only Edit or Delete Their Own URLs
  // if cookie is set and user_id matches database
  if(req.cookies['user_id'] && req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    res.redirect("/urls/" + req.params.shortURL);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  let longy = req.body.longURL;
  let shorty = req.params.shortURL;
  urlDatabase[shorty]['longURL'] = longy;
  res.redirect("/urls");
});