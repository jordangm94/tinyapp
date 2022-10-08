const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", secret: "secret" }));

///////////////////////////////////
//URL Database - Object to store shortened URL and it's corresponding information. The longurl it codes for and user it belong to.
//////////////////////////////////
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

///////////////////////////////////
//Users Database - Object to store information of users who register. Example passwords below are not hashed, entries will be!
//////////////////////////////////
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

///////////////////////////////////
//URLS page - Displays list of users shortened URLS.
//////////////////////////////////
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  //If user exists in user database, allow them to access the /urls page.
  if (user) {
    const thisUsersURLS = urlsForUser(user.id, urlDatabase);
    const templateVars = {
      urls: thisUsersURLS,
      user,
    };
    res.render("urls_index", templateVars);
    //If user does not exist in user database, then do not allow them to access the /urls page.
  } else {
    res.send(
      "Error: In order to see a list of your shortened URLS, you must log in."
    );
  }
});

///////////////////////////////////
//URL NEW page - Brings to create new tiny URL page.
//////////////////////////////////
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  //If userID cookie does not exist on computer, than user does not have account. Redirect to login.
  if (!user) {
    res.redirect("/login");
    return;
  }
  //Otherwise, allow user through.
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

///////////////////////////////////
//URL Post page:
//Triggered when editing URL to replace already existing shortened URL with new URL. I.e. google.ca instead of bestbuy.ca
//////////////////////////////////
app.post("/urls", (req, res) => {
  //Variables to ensure that user aligns with cookie.
  const userID = req.session.user_id;
  const user = users[userID];
  //If user is logged in, allow new URL to be entered into database.
  if (user) {
    //req.body.longurl = inputted url, turn this into random string, store in id.

    let id = generateRandomString(req.body.longURL);

    //Store value of inputted url into a string for later use

    const longURL = req.body.longURL;

    //Assign new id along with url to urlDatabase. This inputs both the id key and url value into database.

    urlDatabase[id] = { longURL: longURL, userID: userID };

    res.redirect(`/urls/${id}`);
    //If user is not logged in, deny entry.
  } else {
    res.send("You are not logged in!");
  }
});

///////////////////////////////////
//ID Page for your URL, will be redirected here after URL inputted in forum!
//////////////////////////////////
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  //A user cannot have access to thhis page if they are not a user.
  if (!user) {
    res.send(
      "Error: In order to see this particular shortened URL, you must log in."
    );
  }
  //Store short Id in a variable.
  const shortID = req.params.id;
  //Here thisUserURLS is checking to see which urls this individual has in its account
  const thisUsersURLS = urlsForUser(userID, urlDatabase);
  //If url does not exist in users account, throw error.
  if (!thisUsersURLS[shortID]) {
    return res.send("Error: This short URL does not belong to this account.");
    //Otherwise allow user to access url via /urls/id (code below).
  } else {
    const longURL = thisUsersURLS[shortID].longURL;
    const templateVars = {
      id: req.params.id,
      longURL,
      user,
    };
    res.render("urls_show", templateVars);
  }
});

///////////////////////////////////
//Redirect shorturls back to website of long url
//////////////////////////////////
app.get("/u/:id", (req, res) => {
  //Once again targetting id of inputted URL
  let id = req.params.id;
  //Check if ID exists in URL Database, if not trigger error.
  if (!urlDatabase[id]) {
    res.send(
      "Error: The short URL you are trying to access does not exist in our database."
    );
  } else {
    //Target longurl in urlDatabase object using id and store in variable.
    let longURL = urlDatabase[id].longURL;
    //Now will redirect to longurl. NOTE: Only works if url is typed starting with http://
    res.redirect(longURL);
  }
});

///////////////////////////////////
//Handle delete request of a url in the database
//////////////////////////////////
app.post("/urls/:id/delete", (req, res) => {
  //Acquire userID from cookie information.
  const userID = req.session.user_id;
  //Use urlsForUser function in order to return urls belonging to user object. I.e. { JckHlB: { longURL: 'http://www.bestbuy.ca', userID: 'k26Ba4' } }
  const thisUsersURLS = urlsForUser(userID, urlDatabase);
  //Designate shortID to be shortened URL, this will allow us to target and access object in comment above.
  let shortID = req.params.id;
  //If we cannot use the shortID to access thisUsersURLS object, than shortened url does not belong to user, throw error. Do not allow delete.
  if (!thisUsersURLS[shortID]) {
    return res.send("Error: This shortID does not belong to you.");
    //Otherwise, allow them to delete (code below).
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
  //Check if the inputted email matches any emails in system, store in user variable.
  const user = getUserByEmail(email, users);
  //If user is falsey, this means email does does not exist in system. Throw error, deny login.
  if (!user) {
    res
      .status(403)
      .send("Error: 403: User with this email address cannot be found.");
    //If the inputted email DOES match email in system, I.e. user truthy, check if inputted password matches, if not deny!
  } else if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
      res
        .status(403)
        .send(
          "Error: 403: User password does not match password in system. Try again."
        );
      //Otherwise allow user into the site via login credentials.
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  }
});

///////////////////////////////////
//Handle redirection after a user chooses to logout.
//////////////////////////////////
app.post("/logout", (req, res) => {
  //Clear cookies off of browser after session is finished for security purposes.
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
//Handle submission of Registration form!
//////////////////////////////////
app.post("/registration", (req, res) => {
  //Generate random string for user ID, and acquire email and password from request and store in variables.
  let user_id = generateRandomString("RandomString");
  let email = req.body.email;
  let password = req.body.password;
  //If email or password are not provided in registration, error.
  if (email === "" || password === "") {
    res
      .status(404)
      .send(
        "Error: 404 Not found. You are missing either a username or password. Please try again!"
      );
    //If Email is found in users database, return error, because cannot register same user twice.
  } else if (getUserByEmail(email, users)) {
    res
      .status(404)
      .send(
        "Error 404: This username has already been registered in our database. Please try again"
      );
    //If no previous email found in user database, register here (code below).
    //Handle hashing password only in the else below, only when officially registering, save server from extra work!
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[user_id] = { id: user_id, email: email, password: hashedPassword };
    req.session.user_id = user_id;
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

///////////////////////////////////
//Display that TinyApp server is live and listening on designated port.
//////////////////////////////////
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});