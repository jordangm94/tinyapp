//Use this file to work with random things free of all other code interrupting. 
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

console.log(generateRandomString('www.google.com'));