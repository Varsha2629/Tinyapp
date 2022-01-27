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
  ur4qtm: {
    longURL: "www.Meta.com",
    user_id: "userRandomID",
  },
  ozsgzu: {
    longURL: "www.google.com",
    user_id: "userRandomID",
  }
  
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

const getUserUrls = (db, cookieUser) => {
  // console.log(db, cookieUser)
  let userUrls = {};

  for (let key of Object.keys(db)) {
    if (db[key]["user_id"] === cookieUser) {
      userUrls[key] = {
        longURL: urlDatabase[key]["longURL"],
        user_id: urlDatabase[key]["user_id"],
      };
    }
    
  }
  console.log('heiw', userUrls)
  return userUrls;
}
app.set("view engine", "ejs");

//All URLs(routes)
// app.get("/", (req, res) => {
//   if (!users[req.cookies["user_id"]]) {
//     return res.redirect("/login");
//   }
//   res.redirect("/urls");
// });

// app.get("/usernotLogin", (req, res) => {
//   res.render("usernotLogin");
// });
app.get("/urls", (req, res) => {
  const cookiesUser = req.cookies.user_id;
  const filterUrlByUser = getUserUrls(urlDatabase, cookiesUser);
  const templateVars = { user: users[cookiesUser], urls: filterUrlByUser };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
  res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {

  const shortUrl = generateRandomString()
  // console.log("body longURL: ", req.body.longURL);  // Log the POST request body to the 
  console.log('urlDatabase', urlDatabase);
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    user_id: req.cookies['user_id'],

  };
  console.log(urlDatabase[shortUrl]);
  res.redirect(`/urls/${shortUrl}`);            // Respond with 'Ok' 
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
    urlDatabase[id] = {
    longURL: req.body.longURL,
    user_id: req.cookies['user_id'],

  };
  //console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const cookieUser = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  if (cookieUser !== urlDatabase[shortURL]["user_id"]) {
    return res.status(403).send("permition to delete is denied!");
   
  } else {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const cookieUser = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  //check if logged in user matches the userID. If not editing is denied

  if (cookieUser !== urlDatabase[shortURL]["user_id"]) {
    return res.status(403).send("permition is Denied!");
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      user_id: req.cookies['user_id'],  
    };
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  // console.log("here i am!")
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars)
});

// handle the request of the register form to the obj
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (!userEmail || !userPass) {
    return res.status(400).send("Please Enter email and password!");
  } else if (emailCheck(users, userEmail)) {
    //console.log('user not found')
    res.status(400).send("User Already registed!");

  } else {
    const user_id = generateRandomString();  // add new user 
    users[user_id] = {
      id: user_id, email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', user_id)
    res.redirect("/urls")
  }

});



app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("login", templateVars)
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  const user = emailCheck(users, userEmail)
  // console.log(users[user].email)

  if (user) {
    if (userPass === users[user].password) {
      res.cookie("user_id", user)
      res.redirect('/urls')
    }else {
      res.status(401).send('Wrong Credentials!')
    }
  }
  res.status(403).redirect('register')
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/login')
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});