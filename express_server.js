// const { render } = require("ejs");
const { generateRandomString, checkUsersEmail } = require("./functionsHelper");

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  abc: {
    id: "abc",
    email: "a@a.com",
    password: "1234",
  },
  def: {
    id: "def",
    email: "b@b.com",
    password: "0987",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const templateVars = { email: req.cookies["email"] };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { email: req.cookies["email"] };
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { email: req.cookies["email"] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  const newId = generateRandomString(6);
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
  // res.send("Ok");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkUsersEmail(email, users)) {
    return res
      .status(403)
      .send("The user associated with this email address could not be found");
  }

  if (checkUsersEmail(email, users)) {
    if (password !== checkUsersEmail(email, users)['password']) {
      return res
      .status(403)
      .send('Sorry, the password you entered is incorrect. Please try again.')
    }
  }

  res.cookie("email", email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const email = req.body.email;
  res.clearCookie("email", email);
  res.redirect("login");
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString(3);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please provide an email AND password");
  }

  if (checkUsersEmail(email, users)) {
    return res
      .status(400)
      .send("This e-mail address has already been registered");
  }

  users[user_id] = { id: user_id, email, password };
  res.cookie("email", email);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
