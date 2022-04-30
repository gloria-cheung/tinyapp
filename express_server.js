// run nodemon with npm start

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// when new users are made through registration, pushed onto this empty object
const users = {};

// helper functions:
function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
}

function createNewUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("email and/or password cannot be empty");
  } else {
    const ID = generateRandomString();
    users[ID] = {
    id: ID,
    email: email,
    password: password
    };
    return users[ID];
  }
}

function checkEmailExist(newEmail) {
  for (let user in users) {
    if (users[user].email === newEmail) {
      return false;
    } 
  }
  return true;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//GET req to /register to display form to login
app.get("/register", (req, res) => {
  const templateVars = {
    userID: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

// POST req to /register to add user to users object and display in header as logged in
app.post("/register", (req, res) => {
  const emailOK = checkEmailExist(req.body.email);
  if (!emailOK) {
    res.status(400).send("email already used, please try another email");
  } else {
    const newUser = createNewUser(req, res);
    res.cookie("user_id", newUser.id);
    res.redirect("/urls");
  }
});

// GET req to path /urls that displays table of long and short URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// GET request to /urls/new to display form for submitting URL to make into shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// POST request using info from form submitted to alter urlDatabase object and redirect to show the URL is created
app.post("/urls", (req, res) => {
  res.status(200);
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// GET request to display single shortURL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

// GET request to redirect us to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Delete path from form
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Update path from form
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//  NO LONGER NEEDING THIS PATH DUE TO CHANGING FROM LOGIN WITH JUST USERNAME TO REGISTERING WITH EMAIL AND PASSWORD
// // login path using cookies
// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   res.cookie("username", username);
//   res.redirect("/urls");
// });

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});