const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true })); // The body-parser library will convert the request(POST) body from a Buffer into string that we can read.


app.set("view engine", "ejs"); // This tells the Express app to use EJS as its templating engine.

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase.id };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let newKey = generateRandomString()
  urlDatabase[newKey] = req.body.longURL
  //console.log(req.body); // Test: Log the POST request body to the console
  //res.send("Ok"); // Test: Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/:${newKey}`);
});

function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(6);
};

app.get("/u/:id", (req, res) => {
   const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
 res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});