const {
  generateRandomString,
  checkUsersEmail,
  urlsForUser,
} = require("./helperFunctions");

const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // allows you to use ejs templates
app.use(express.urlencoded({ extended: true })); // creates req.body
app.use(
  cookieSession({
    name: "session",
    keys: ["hellothisisakey"],
  })
);

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

const plaintextPassword = "1234";
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

////////////////////////////////////////////////////
//               GET routes
///////////////////////////////////////////////////

// Home page - redirects to My URLs page
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Login page
app.get("/login", (req, res) => {
  if (req.session["email"]) {
    return res.redirect("/urls");
  }

  const templateVars = { email: req.session["email"] };
  return res.render("login", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  if (req.session["email"]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user_id: req.session["id"],
    email: req.session["email"],
  };
  return res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session["email"]) {
    return res.redirect("/login");
  }

  const templateVars = { email: req.session["email"] };
  return res.render("urls_new", templateVars);
});

// My URLs page
app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const url = urlsForUser(userId, urlDatabase);

  const templateVars = {
    user_id: userId,
    email: req.session["email"],
    urls: url,
  };

  return res.render("urls_index", templateVars);
});

// Single shortened URL page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session["user_id"];

  if (!userId) {
    return res.send(
      "Access to this URL is restricted to logged-in users. Please log in to view this page."
    );
  }
  if (!urlDatabase[id]) {
    return res.send(
      "Oops, the shortened URL you're trying to access doesn't exist in our database. Please make sure you have the correct URL or create a new shortened link."
    );
  }

  if (userId !== urlDatabase[id]["userID"]) {
    return res.send(
      "Access to this URL is restricted to its owner. Please ensure you have the correct access privileges to view this page."
    );
  }

  const templateVars = {
    email: req.session["email"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]["longURL"],
  };
  return res.render("urls_show", templateVars);
});

// Redirect shortened URL route
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send(
      "Oops, the shortened URL you're trying to access doesn't exist in our database. Please make sure you have the correct URL or create a new shortened link."
    );
  }

  const longURL = urlDatabase[req.params.id]["longURL"];
  return res.redirect(longURL);
});


////////////////////////////////////////////////////
//                 POST routes
///////////////////////////////////////////////////

// Login action
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

  req.session.user_id = userId;
  req.session.email = email;
  return res.redirect("/urls");
});

// Logout action
app.post("/logout", (req, res) => {
  req.session.email = null;
  req.session.user_id = null;
  return res.redirect("login");
});

// Register action
app.post("/register", (req, res) => {
  const userId = generateRandomString(6);
  const email = req.body.email;
  const plaintextPassword = req.body.password;
  const password = bcrypt.hashSync(plaintextPassword, salt);

  if (!email || !plaintextPassword) {
    return res.status(400).send("Please provide an email AND password");
  }

  if (checkUsersEmail(email, users)) {
    return res
      .status(400)
      .send("This e-mail address has already been registered");
  }

  users[userId] = { id: userId, email, password };
  req.session.user_id = userId;
  req.session.email = email;
  return res.redirect("/urls");
});

// Shorten URLs action
app.post("/urls", (req, res) => {
  if (!req.session["email"]) {
    return res.send(
      "Sorry, you need to be logged in to shorten URLs. Please log in or create an account to access this feature."
    );
  }

  if (!req.body.longURL) {
    return res.send("Please insert a valid URL");
  }

  const newId = generateRandomString(6);
  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };
  return res.redirect(`/urls/${newId}`);
});

// Delete shortened URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.session["user_id"];
  const shortURLObj = urlDatabase[id];

  if (!userId) {
    return res.send(
      "Access to this URL is restricted to logged-in users. Please log in to view this page."
    );
  }

  if (!shortURLObj) {
    return res.send(
      "The requested ID does not exist. Please check the provided ID and try again."
    );
  }

  if (userId !== shortURLObj.userID) {
    return res.send(
      "Access denied. This URL does not belong to your account. Please ensure you are the rightful owner to view or modify this URL."
    );
  }

  delete urlDatabase[id];
  return res.redirect("/urls");
});

// Edit shortened URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const shortURLObj = urlDatabase[id];
  const userId = req.session["user_id"];

  if (!userId) {
    return res.send(
      "To access this feature, you must be logged in. Please log in to continue."
    );
  }

  if (!shortURLObj) {
    return res.send(
      "The requested ID does not exist. Please check the provided ID and try again."
    );
  }

  if (userId !== shortURLObj.userID) {
    return res.send(
      "Access denied. This URL does not belong to your account. Please ensure you are the rightful owner to view or modify this URL."
    );
  }

  if (!req.body.newURL) {
    return res.send("Please insert a valid URL");
  }

  shortURLObj.longURL = req.body.newURL;
  return res.redirect("/urls");
});

// Connect to server
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
