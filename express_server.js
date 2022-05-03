// run nodemon with npm start

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key 1", "key 2"]
}));
app.use(morgan("tiny"));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// when new users are made through registration, pushed onto this empty object
const users = {};

// helper functions:
function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
}

function createNewUser(req) {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const ID = generateRandomString();
  users[ID] = {
    id: ID,
    email: email,
    hashedPassword: hashedPassword
  };
  return users[ID];
}

function checkPassword(user, newPassword) {
  return bcrypt.compareSync(newPassword, user.hashedPassword);
}

function urlsForUser(id) {
  const urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = {};
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
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
    userID: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

// POST req to /register to add user to users object and display in header as logged in
app.post("/register", (req, res) => {
  const user = getUserByEmail(req.body.email, users)
  if (user) {
    res.status(400).send("email already used, please try another email");
  } else {
    const newUser = createNewUser(req);
    req.session.user_id = newUser.id;
    res.redirect("/urls");
  }
});

// new GET req to display login form
app.get("/login", (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

// new POST req to /login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    const passwordCorrect = checkPassword(user, req.body.password);
    if (passwordCorrect) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("password incorrect for given email");
    }
  } else {
    res.status(403).send("email cannot be found");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// GET req to path /urls that displays table of long and short URLs
app.get("/urls", (req, res) => {
  const urls = urlsForUser(req.session.user_id);
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id],
    urls: urls
  };
  res.render("urls_index", templateVars);
});

// GET request to /urls/new to display form for submitting URL to make into shortURL; only allowed if user is logged in
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {
    res.status(400).send("please login / register in order to shorten URL");
  } else {
    res.render("urls_new", templateVars);
  }
});

// POST request using info from form submitted to alter urlDatabase object and redirect to show the URL is created
app.post("/urls", (req, res) => {
  res.status(200);
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = userID;
  res.redirect(`/urls/${shortURL}`);
});

// GET request to display single shortURL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL.longURL],
    userID: req.session.user_id,
    user: users[req.session.user_id]
  };
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("can only view URL if you created it");
  }
});

// GET request to redirect us to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("shortURL ID does not exist");
  } else {
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      res.redirect(longURL);
    } else {
      res.status(400).send("can only view URL if you created it");
    }
  }
});

// Delete path from form
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    if (!urlDatabase[shortURL]) {
      res.status(400).send("this URL does not exist");
    } else {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  } else {
    res.status(400).send("cannot delete URL unless you created it");
  }
});

// Update path from form
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    if (!urlDatabase[shortURL]) {
      res.status(400).send("this URL does not exist");
    } else {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect("/urls");
    }
  } else {
    res.status(400).send("cannot edit URL unless you created it");
  }
});

//  NO LONGER NEEDING THIS PATH DUE TO CHANGING FROM LOGIN WITH JUST USERNAME TO REGISTERING WITH EMAIL AND PASSWORD
// // login path using cookies
// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   res.cookie("username", username);
//   res.redirect("/urls");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});