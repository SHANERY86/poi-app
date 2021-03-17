# Places of Interest App v1.0

## Description
This app allows a user to set up an account and store information about places in the world that they are interested in. This is an assigment required for the completion of the Enterprise Web Development module in the HDip in Computer Science 2020 course at Waterford Institute of Technology.

<br />

## Associated frameworks and plugins
Name|Function|
|---|--------|
|hapi|Node.js server framework|
|hapi/inert|hapi plugin for static files and directories
|hapi/vision|hapi plugin for html templates
|hapi/cookie|hapi plugin for cookies
|mongoose|database framework
|cloudinary|plugin for image management
|handlebars|html templating language
|UIKit|HTML/CSS Front-end Framework
|Font Awesome|Icon styling set
|dotenv|initialisation file manager

<br />

To install above:
```
npm install @hapi/hapi
npm install @hapi/inert
npm install @hapi/vision
npm install @hapi/cookie
npm install handlebars
npm install cloudinary
npm install mongoose
```
See layout.hbs for UIkit and Font Awesome initialisation

<br>

To use mongoose and cloudinary, you must setup accounts, and declare your accout information to link the app to them<br>
This app is setup to initialise within a .env file with a layout as below

```
cookie_name=name
cookie_password=your-password-here
db=mongodb+srv://paste-your-db-link-here

# cloudinary details
name=cloudinary-account-name
key=your-key
secret=your-secret-key
```

## Updates

### v1.1
* Authentation/Cookies (@hapi/cookie)
* Images (Upload/View) (cloudinary)
* Update/Delete POI.

## Roadmap

### v1.2
* User Account Admin
* Place Categories


## Author
Shane Ryan <br />
shanery86@gmail.com
