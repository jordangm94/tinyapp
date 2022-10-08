///////////////////////////////////
//This function looks for email in database, if match, returns the user object.
//////////////////////////////////
function getUserByEmail(email, database) {
  for (let key in database) {
    if (email === database[key].email) {
      return database[key];
    }
  }
}
///////////////////////////////////
//This function generates a randomString of 6 charachters, used to assign random IDs in project.
//////////////////////////////////
function generateRandomString(randomString) {
  const alphaNumerics =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
///////////////////////////////////
//This function looks up the URLS belonging to users and returns shortURL object containing longURL and UserID. 
//////////////////////////////////
function urlsForUser(userID, urlDatabase) {
  const results = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      results[shortURL] = urlDatabase[shortURL];
    }
  }
  return results;
}

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};