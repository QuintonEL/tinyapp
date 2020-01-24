# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Registration page"](https://github.com/QuintonEL/tinyapp/blob/master/docs/register.png?raw=true)
!["Edit the long url address"](https://github.com/QuintonEL/tinyapp/blob/master/docs/urls-edit.png?raw=true)
!["Index of all created urls"](https://github.com/QuintonEL/tinyapp/blob/master/docs/urls-index.png?raw=true)
!["Add a new long url to shorten"](https://github.com/QuintonEL/tinyapp/blob/master/docs/urls-new.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.


### Express Setup

- Initalize NPM  
	- **`npm init -y`** *(-y to accept default)*
- Install Express
	- **`npm install express`**
- Start your server!
	- **`node express_server.js`**
​
### EJS Setup

- Install EJS as dependency 
	- **`npm install ejs`**
- Set EJS as view engine
	- **`app.set("view engine", "ejs");`**
​
### Cookie-Session Setup

- Install *cookie-session*
	- **`npm install cookie-session`**
- Require *cookie-session*
	- **`const cookieSession = require('cookie-session');`**
​
### BCRYPT Setup

- Install *bcrypt* package
	- **`npm install -E bcrypt@2.0.0`** *(check version compatability!)*
- Require *bcrypt* package
	- **`const bcrypt = require('bcrypt');`**
​
### Nodemon Setup _*(optional)*_

- Install *Nodemon* 
	- **`npm install --save-dev nodemon`**
- Edit scripts to allow for quick start-up
	- **`"start": "./node_modules/.bin/nodemon -L express_server.js"`**
- Start your server!
	- **`npm start`**