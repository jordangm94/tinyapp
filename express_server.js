const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", secret: "secret"}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "a",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "b",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if(user) {
    const thisUsersURLS = urlsForUser(user.id, urlDatabase);
    const templateVars = {
      urls: thisUsersURLS,
      user
    };
    res.render("urls_index", templateVars);
  } else {
    res.send('Error: In order to see a list of your shortened URLS, you must log in.');
  }
});

///////////////////////////////////
//URL NEW page - Brings to create new tiny URL page, only is user logged in, if not user redirected to login page!
//////////////////////////////////

app.get("/urls/new", (req, res) => {
  //Variables to ensure that user aligns with cookie.
  const id = req.session.user_id;
  const user = users[id];
  //If userID cookie exists on computer, than this means they have an account and are logged in, allow through
  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

///////////////////////////////////
//URL Post page. Triggered when trying to edit existing url in urls/id OR when clicking edit button inputted in forum and posting to /URLS list, once triggered rediret to ID Page for URL.
//////////////////////////////////

app.post("/urls", (req, res) => {
  //Variables to ensure that user aligns with cookie.
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    //req.body.longurl = inputted url, turn this into random string, store in id.

    let id = generateRandomString(req.body.longURL);

    //Store value of inputted url into a string for later use

    const longURL = req.body.longURL;

    //Assign new id along with url to urlDatabase. This inputs both the id key and url value into database.

    urlDatabase[id] = { longURL: longURL, userID: userID };

    res.redirect(`/urls/${id}`); // Redirection to /urls/:id
  } else {
    res.send('You are not logged in!')
  }
});

///////////////////////////////////
//ID Page for your URL, redirected here after URL inputted in forum!
//////////////////////////////////

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.send('Error: In order to see this particular shortened URL, you must log in.')
  }
  //Store Id in a variable.
  const shortID = req.params.id;
  //Here thisUserURLS is checking to see which urls this individual has in its account
  const thisUsersURLS = urlsForUser(userID, urlDatabase);
  if (!thisUsersURLS[shortID]) {
    return res.send('Error: This short URL does not belong to this account.');
  } else {
    const longURL = thisUsersURLS[shortID].longURL;
    const templateVars = {
      id: req.params.id,
      longURL,
      user
    };
    res.render("urls_show", templateVars);
  }
  //Use id variable to target long url value through object!
});
///////////////////////////////////
//Redirect shorturls back to website of long url
//////////////////////////////////
app.get("/u/:id", (req, res) => {
  //Once again targetting id of inputted URL
  let id = req.params.id;
  //Check if ID exists in URL Database, if not trigger error. 
  if (!urlDatabase[id]) {
    res.send('Error: The short URL you are trying to access does not exist in our database.')
  } else {
      //Target longurl in object using id and store in variable
      let longURL = urlDatabase[id].longURL;
    //Now will redirect to longurl. NOTE: Only works if url is typed starting with http://
    res.redirect(longURL);
  }
});

///////////////////////////////////
//Handle delete request of a url in the database
//////////////////////////////////

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  // if (!user) {
  //   res.send('Error: Only users can delete urls.')
  // }
  // thisUsersURLS = {
    // abc123: { longURL: 'something', userID: 'J123'}, 
    // zzz123: { longURL: 'something2', userID: 'J123'}, 
    // def123: { longURL: 'something3', userID: 'J123'}, 
  //}
  // shortID = asd764
  // urldatabase[shortID] =  { longURL: 'something', userID: 'J123'}
  const thisUsersURLS = urlsForUser(userID, urlDatabase);
  let shortID = req.params.id;
  if (!thisUsersURLS[shortID]) {
    return res.send('Error: This shortID does not belong to you.')
  } else {
    delete urlDatabase[shortID];
    res.redirect(`/urls`);
  }
});

///////////////////////////////////
//Handle redirection to urls/id, such as when you click edit on a particular id
//////////////////////////////////

app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});
///////////////////////////////////
//Handle redirection after user has submitted username, will store username as cookie.
//////////////////////////////////
app.post("/login", (req, res) => {
  //Assign inputted emails and password to variables.
  let email = req.body.email;
  let password = req.body.password;
  //Check if the inputted email matches any emails in system, if so deny login.
  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403).send("Error: 403: User with this email address cannot be found.");
    //Next, if the inputted email DOES match email in system, check if inputted password matches, if not deny!
  } else if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(403).send("Error: 403: User password does not match password in system. Try again.");
    } else {
      // res.cookie("user_id", user.id);
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  }
});

///////////////////////////////////
//Handle redirection after a user chooses to logout.
//////////////////////////////////
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
});

///////////////////////////////////
//Handle getting registration page to sign up for account.
//////////////////////////////////

app.get("/registration", (req, res) => {
  const templateVars = { user: req.session.user_id };
  res.render("urls_registration", templateVars);
});

///////////////////////////////////
//Handle redirection if registration form is submitted(is posted)!
//////////////////////////////////
app.post("/registration", (req, res) => {
  let user_id = generateRandomString("RandomString");
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(404).send("Error: 404 Not found. You are missing either a username or password. Please try again!");
  } else if (getUserByEmail(email, users)) {
      res.status(404).send("Error 404: This username has already been registered in our database. Please try again");
  } else {
      users[user_id] = { id: user_id, email: email, password: hashedPassword };
      // res.cookie("user_id", id);
      req.session.user_id = user_id;
      // const templateVars = { username: req.cookies["username"] }
     // res.render("urls_registration", templateVars)
      res.redirect("/urls");
  }
});

///////////////////////////////////
//Handle login page!
//////////////////////////////////
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});