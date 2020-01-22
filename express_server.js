const express = require("express");
const app = express();
var cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // This tells the Express app to use EJS as its templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.post("/login", (req, res) => {
  let user = req.body.username
  res.cookie('username', user)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString(6);
  urlDatabase[newShortUrl] = `http://www.${req.body.longURL}`;
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

app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let userRandomID = generateRandomString(6);
  users[userRandomID] = {
    id: userRandomID, 
    email: req.body.email, 
    password: req.body.password
  };
  console.log(users[userRandomID])
  res.cookie('user_id', userRandomID)
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shorty = req.params.shortURL;
  delete urlDatabase[shorty];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shorty = req.params.shortURL;
  res.redirect("/urls/" + shorty);
});

app.post("/urls/:shortURL/update", (req, res) => {
  let longy = req.body.longURL;
  let shorty = req.params.shortURL;
  urlDatabase[shorty] = longy;
  res.redirect("/urls");
});



// if (email && password) {
//   const extinguisher = findUserByEmail(email)
//   if (extinguisher) {
//     res.status(400).send('you already have an account')
//   } else {
//     const createUser = addUser(req.body);
//       res.cookie('userID', createdUser.id)
//   }
// }
// exports.findUserByEmail = (email) => {
//   for (const user of Object.values(users)) {
//     if (user.email === email) {
//        return user;
//     }
//   }
// }
// use if else in header file to chenge what the user sees depending on whether or not they are loggged in
// if (user) {logout and other normal options}
// else {login and register}