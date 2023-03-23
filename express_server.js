const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true })); // The body-parser library will convert the request(POST) body from a Buffer into string that we can read.
app.use(cookieParser()); // It solved the error of "username of undefined"

app.set("view engine", "ejs"); // This tells the Express app to use EJS as its templating engine.

const urlDatabase = {
  b2xVn2 : {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "testID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  testID: {
    id: "testID",
    email: "test@example.com",
    password: "123",
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

const urlsForUser = function(id) {
  const urlsObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlsObj[key] = urlDatabase[key].longURL;
    }
  } return urlsObj;
};

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.send("Please sign in to see your URLs");
  }
  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }
  const templateVars = {user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }
  if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
    res.send(`You don't have ${req.params.id} ID in your URLs list!`);
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.send("Please sign in to shorten the URL");
  }
  let newKey = generateRandomString();
  urlDatabase[newKey].longURL = req.body.longURL;
  //console.log(req.body); // Test: Log the POST request body to the console
  //res.send("Ok"); // Test: Respond with 'Ok'
  res.redirect(`/urls/${newKey}`);
});

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(6);
};

app.get("/u/:id", (req, res) => {
  if (!(req.params.id in urlDatabase)) {
    res.send("This ID does not exist!");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!(req.params.id in urlDatabase)) {
    res.send("This ID does not exist!");
  }
  if (!req.cookies.user_id) {
    res.send("Please sign in to edit the URL");
  }
  if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
    res.send(`You don't have ${req.params.id} ID in your URLs list!`);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!(req.params.id in urlDatabase)) {
    res.send("This ID does not exist!");
  }
  if (!req.cookies.user_id) {
    res.send("Please sign in to edit the URL");
  }
  if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
    res.send(`You don't have ${req.params.id} ID in your URLs list!`);
  }
  urlDatabase[req.params.id] = req.body.edit;
  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  }
  const templateVars = {user: users[req.cookies.user_id] };
  res.render("register_view", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Email or password is empty!");
    return;
  }
  if (userFinder(req.body.email)) {
    return res.status(400).send("Email already exists!");
  }
  let id = generateRandomString();
  users[id] = {};
  users[id].id = id;
  users[id].email = req.body.email;
  users[id].password = req.body.password;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

const userFinder = function(req) {
  for (let key in users) {
    if (users[key].email === req) {
      return true;
    }
  } return false;
};

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  }
  const templateVars = {user: users[req.cookies.user_id] };
  res.render("login_view", templateVars);
});

app.post("/login", (req, res) => {
  if (!userFinder(req.body.email)) {
    return res.status(403).send("Email NOT found!");
  }
  for (let key in users) {
    if (users[key].email === req.body.email) {
      if (users[key].password === req.body.password) {
        res.cookie("user_id", users[key].id);
        res.redirect("/urls");
      }
    }
    return res.status(403).send("Wrong password!");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.id);
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});