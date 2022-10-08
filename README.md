# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product:

### Login Page

!["Login Page"](https://github.com/jordangm94/tinyapp/blob/master/docs/urls:login-page.png?raw=true)

### App Cookies After Login

!["How cookies appear after login"](https://github.com/jordangm94/tinyapp/blob/master/docs/urls:cookies.png?raw=true)

### My Shortened URLS Page

!["My Shortened URLS Page"](https://github.com/jordangm94/tinyapp/blob/master/docs/urls-page.png?raw=true)

### Create TinyURL Page

!["Create TinyURL Page"](https://github.com/jordangm94/tinyapp/blob/master/docs/urls:new-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Important Notes:
- The Tiny App web application works best when using full urls in url shortening process.
  - I.e. https://www.google.ca/ vs. www.google.ca
- When testing app refrain from using example users in user database, register a new user and use your credentials to login.
  - This is because the login post route uses `bcrypt.compareSync` and expects to receive a hashed password from database when comparing passwords. 
  - However, example passwords were not hashed and this will result in login failure. 
- All helper functions for this web application are stored in the helpers.js file. 