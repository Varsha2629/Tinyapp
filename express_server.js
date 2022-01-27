const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}

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

const emailCheck = (db, email) => {
  for (const user in db) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
  return false;
}

app.set("view engine", "ejs");



//All URLs(routes)
app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['username']] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {

  const shortUrl = generateRandomString()
  console.log("body longURL: ", req.body.longURL);  // Log the POST request body to the 
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`urls/${shortUrl}`);            // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  const user = emailCheck(users, userEmail)
  console.log(users[user].email)

  if (user) {
    if (userPass === users[user].password) {
      res.cookie("user_id", user)
      res.redirect('/urls')
    }
  }
  res.sendStatus(403)
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/urls')
});

// handle the request of the register form to the obj
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (!userEmail || !userPass) {
    res.sendStatus(400)
  } else if (emailCheck(users, userEmail)) {
    //console.log('user not found')
    res.sendStatus('User already Exits', 400)

  } else {
    const user_id = generateRandomString();  // add new user 
    users[user_id] = {
      id: user_id, email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id')
    res.redirect("/urls")
  }

});

app.get("/register", (req, res) => {
  // console.log("here i am!")
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("register", templateVars)
});


app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("login", templateVars)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});