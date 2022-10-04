let longUrlValue = "";

function generateRandomString(randomString) {
  const alphaNumerics = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let newString = "";
  let loopCount = 0;
  for (let value of randomString) {
    value = alphaNumerics[Math.floor(Math.random() * alphaNumerics.length)];
    newString += value;
    loopCount = loopCount + 1;
    if (loopCount > 5) {
      break;
    }
  }
  return newString;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

///////////////////////////////////
//URL list page. Triggered after new url inputted in forum and posting to /URLS list, once triggered rediret to ID Page for URL.  
//////////////////////////////////

app.post("/urls", (req, res) => {
  //req.body.longurl = inputted url, turn this into random string, store in id.

  let id = generateRandomString(req.body.longURL);

  //Store value of inputted url into a string for later use

  longUrlValue = req.body.longURL

  //Assign new id along with url to urlDatabase. This inputs both the id key and url value into database. 

  urlDatabase[id] = req.body.longURL 
  
  console.log(urlDatabase); // Log the new URL DATABASE
  
  res.redirect(`/urls/${id}`); // Redirection to /urls/:id
});

///////////////////////////////////
//ID Page for your URL, redirected here after URL inputted in forum! 
//////////////////////////////////

app.get("/urls/:id", (req, res) => {
  //Store Id in a variable. Slice to eliminate the period at front of id.
  let id = req.params.id
  //Use id variable to target long url value through object! 
  const templateVars = { id: req.params.id, longURL: urlDatabase[id] };
  console.log(id);
  res.render("urls_show", templateVars);
});
///////////////////////////////////
//Redirect shorturls back to website of long url
//////////////////////////////////
app.get("/u/:id", (req, res) => {
  //Once again targetting id of inputted URL
  let id = req.params.id

  //Target longurl in object using id and store in variable

  let longURL = urlDatabase[id];

  //Now will redirect to longurl. NOTE: Only works if url is typed starting with http://
  res.redirect(longURL);
});

///////////////////////////////////
//Handle delete request of a url in the database
//////////////////////////////////

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id
  delete urlDatabase[id];
  res.redirect(`/urls`)
});





app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});