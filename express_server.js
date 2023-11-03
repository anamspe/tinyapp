// const { render } = require("ejs");
const { generateRandomString, checkUsersEmail, urlsForUser } = require("./functionsHelper");

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase0 = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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

const users = {
  abc: {
    id: "abc123",
    email: "a@a.com",
    password: "1234",
  },
  def: {
    id: "def098",
    email: "b@b.com",
    password: "0987",
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
  const user_id = req.cookies['user_id'];
  const url = urlsForUser(user_id, urlDatabase);

  const templateVars = {
    user_id: req.cookies['user_id'],
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
  const user_id = checkUsersEmail(email, users)["id"];

  if (!checkUsersEmail(email, users)) {
    return res
      .status(403)
      .send("The user associated with this email address could not be found");
  }

  if (checkUsersEmail(email, users)) {
    if (password !== checkUsersEmail(email, users)["password"]) {
      return res
        .status(403)
        .send(
          "Sorry, the password you entered is incorrect. Please try again."
        );
    }
  }

  res.cookie("user_id", user_id);
  res.cookie("email", email);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const email = req.body.email;
  const user_id = req.body.user_id;
  res.clearCookie("email", email);
  res.clearCookie("user_id", user_id);
  return res.redirect("login");
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString(6);
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
  return res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.cookies['user_id'];
  const shortURLObj = urlDatabase[id];
  console.log(id);
  console.log(user_id);

  if (!user_id) {
    return res.send("Access to this URL is restricted to logged-in users. Please log in to view this page.")
  }

  if (!shortURLObj) {
    return res.send("The requested ID does not exist. Please check the provided ID and try again.")
  }

  if(user_id !== shortURLObj.userID) {
    return res.send("Access denied. This URL does not belong to your account. Please ensure you are the rightful owner to view or modify this URL.")
  }
  
  delete urlDatabase[id];
  return res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.cookies['user_id'];

  if (!user_id) {
    return res.send("Access to this URL is restricted to logged-in users. Please log in to view this page.");
  }
  if (!urlDatabase[id]) {
    return res.send("Oops, the shortened URL you're trying to access doesn't exist in our database. Please make sure you have the correct URL or create a new shortened link.");
  }

  if (user_id !== urlDatabase[id]['userID']) {
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
  const user_id = req.cookies['user_id']
  
  if (!user_id) {
    return res.send("To access this feature, you must be logged in. Please log in to continue.")
  }

  if (!shortURLObj) {
    return res.send("The requested ID does not exist. Please check the provided ID and try again.");
  }

  if (user_id !== shortURLObj.userID) {
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
