
const { getUserByEmail, getUserUrls, generateRandomString } = require('./helpers');

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['861a4ba3-7bfe-420a-9ce2-a49a25c61645', '4e32a74a-b55b-4a50-a8cc-6384ce6a5dfc']
}));



const urlDatabase = {
  ur4qtm: {
    longURL: "www.Meta.com",
    user_id: "userRandomID",
  },
  ozsgzu: {
    longURL: "www.google.com",
    user_id: "userRandomID",
  },
  222222: {
    longURL: "www.facebook.com",
    user_id: "userRandomID",
  }

};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('lover', salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


app.set("view engine", "ejs");

//All URLs(routes)
app.get("/", (req, res) => {
  res.redirect("/urls");

});


app.get("/urls", (req, res) => {
  const cookiesUser = req.session.user_id;
  const filterUrlByUser = getUserUrls(urlDatabase, cookiesUser);
  const templateVars = { user: users[cookiesUser], urls: filterUrlByUser };
  res.render("urls_index", templateVars);

});

app.post("/urls", (req, res) => {

  const shortUrl = generateRandomString()
  console.log('urlDatabase', urlDatabase);
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    user_id: req.session['user_id'],

  };

  res.redirect(`/urls/${shortUrl}`);            // Respond with 'Ok' 
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: req.body.longURL,
    user_id: req.session['user_id'],

  };
  res.redirect(`/urls`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session['user_id']] };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('Please login to view your urls!');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session['user_id']] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});



app.post("/urls/:shortURL/delete", (req, res) => {
  const cookieUser = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (cookieUser !== urlDatabase[shortURL]["user_id"]) {
    return res.status(403).send("permition to delete is denied!");

  } else {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);

  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const cookieUser = req.session.user_id;
  const shortURL = req.params.shortURL;
  //check if logged in user matches the userID. If not editing is denied

  if (cookieUser !== urlDatabase[shortURL]["user_id"]) {
    return res.status(403).send("permition is Denied!");
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      user_id: req.session['user_id'],
    };
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {

  const templateVars = {
    //user: users[req.session["user_id"]]
    user: null
  }
  res.render("register", templateVars)
});

// handle the request of the register form to the obj
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const id = generateRandomString()

  const user = {
    id,
    email: userEmail,
    password: bcrypt.hashSync(req.body.password, 3)
  }
  if (userEmail === '' || userPass === '') {
    res.status(400).send('email and password can not be empty');
    return
  }
  if (getUserByEmail(userEmail, user)) {
    res.status(400).send('email already exits!')
  }
  users[id] = user;
  console.log(users);
  req.session.user_id = id;

  res.redirect("/urls")


});

app.get('/login', (req, res) => {
  const templateVars = {
    // set user to null
    user: users[req.session.user_id]
  }
  res.render("login", templateVars)
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  const user = getUserByEmail(userEmail, users)

  if (user && bcrypt.compareSync(userPass, user.password)) {

    req.session.user_id = user.id;

    res.redirect('/urls')

  } else {
    res.status(403).send('Wrong Credentials!')
  }

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login')
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});