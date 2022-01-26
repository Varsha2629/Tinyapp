const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => { 
  return Math.random().toString(36).slice(2, 8);
 }

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// middleware
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//All URLs
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: req.cookies["username"] ? urlDatabase : {}};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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
  res.cookie("username", req.body.username)
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect('/urls')
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});