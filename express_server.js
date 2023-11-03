// const { render } = require("ejs");
const { generateRandomString, checkUsersEmail, urlsForUser } = require("./functionsHelper");

const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "abc123",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "abc123",
  },
};

const plaintextPassword = '1234'
const salt = bcrypt.genSaltSync(10);
const userPassword = bcrypt.hashSync(plaintextPassword, salt);

const users = {
  abc123: {
    id: "abc123",
    email: "a@a.com",
    password: userPassword,
  },
  def098: {
    id: "def098",
    email: "b@b.com",
    password: userPassword,
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  if (req.cookies["email"]) {
    return res.redirect("/urls");
  }

  const templateVars = { email: req.cookies["email"] };
  return res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const url = urlsForUser(userId, urlDatabase);

  const templateVars = {
    user_id: userId,
    email: req.cookies["email"],
    urls: url,
  };
  // console.log(templateVars['urls']);
  return res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies["email"]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user_id: req.cookies["id"],
    email: req.cookies["email"],
  };
  return res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["email"]) {
    return res.redirect("/login");
  }

  const templateVars = { email: req.cookies["email"] };
  return res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  if (!req.cookies["email"]) {
    return res.send(
      "Sorry, you need to be logged in to shorten URLs. Please log in or create an account to access this feature."
    );
  }
  const newId = generateRandomString(6);
  urlDatabase[newId] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  console.log(urlDatabase);
  return res.redirect(`/urls/${newId}`);
  // res.send("Ok");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = checkUsersEmail(email, users)["id"];
  const shortURLObj = checkUsersEmail(email, users);

  if (!checkUsersEmail(email, users)) {
    return res
      .status(403)
      .send("The user associated with this email address could not be found");
  }

  const result = bcrypt.compareSync(password, shortURLObj.password);
  if (checkUsersEmail(email, users)) {
    if (!result) {
      return res
        .status(403)
        .send(
          "Sorry, the password you entered is incorrect. Please try again."
        );
    }
  }

  res.cookie("user_id", userId);
  res.cookie("email", email);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const email = req.body.email;
  const userId = req.body.user_id;
  res.clearCookie("email", email);
  res.clearCookie("user_id", userId);
  return res.redirect("login");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(6);
  const email = req.body.email;
  const plaintextPassword = req.body.password;
  const password = bcrypt.hashSync(plaintextPassword, salt)

  if (!email || !plaintextPassword) {
    return res.status(400).send("Please provide an email AND password");
  }

  if (checkUsersEmail(email, users)) {
    return res
      .status(400)
      .send("This e-mail address has already been registered");
  }

  users[userId] = { id: userId, email, password };
  res.cookie("email", email);
  res.cookie("user_id", userId);
  return res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies['user_id'];
  const shortURLObj = urlDatabase[id];
  console.log(id);
  console.log(userId);

  if (!userId) {
    return res.send("Access to this URL is restricted to logged-in users. Please log in to view this page.")
  }

  if (!shortURLObj) {
    return res.send("The requested ID does not exist. Please check the provided ID and try again.")
  }

  if(userId !== shortURLObj.userID) {
    return res.send("Access denied. This URL does not belong to your account. Please ensure you are the rightful owner to view or modify this URL.")
  }
  
  delete urlDatabase[id];
  return res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies['user_id'];

  if (!userId) {
    return res.send("Access to this URL is restricted to logged-in users. Please log in to view this page.");
  }
  if (!urlDatabase[id]) {
    return res.send("Oops, the shortened URL you're trying to access doesn't exist in our database. Please make sure you have the correct URL or create a new shortened link.");
  }

  if (userId !== urlDatabase[id]['userID']) {
    return res.send("Access to this URL is restricted to its owner. Please ensure you have the correct access privileges to view this page.")
  }

  const templateVars = {
    email: req.cookies["email"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]['longURL'],
  };
  return res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  const shortURLObj = urlDatabase[id]
  const userId = req.cookies['user_id']
  
  if (!userId) {
    return res.send("To access this feature, you must be logged in. Please log in to continue.")
  }

  if (!shortURLObj) {
    return res.send("The requested ID does not exist. Please check the provided ID and try again.");
  }

  if (userId !== shortURLObj.userID) {
    return res.send("Access denied. This URL does not belong to your account. Please ensure you are the rightful owner to view or modify this URL.")
  }

  shortURLObj.longURL = req.body.newURL;
  return res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("Oops, the shortened URL you're trying to access doesn't exist in our database. Please make sure you have the correct URL or create a new shortened link.")
  }

  const longURL = urlDatabase[req.params.id]['longURL'];
  return res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
