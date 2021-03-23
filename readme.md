# Places of Interest App v1.2

## Description
This app allows a user to set up an account and store information about places in the world that they are interested in. This is an assigment required for the completion of the Enterprise Web Development module in the HDip in Computer Science 2020 course at Waterford Institute of Technology.

<br />

## Instructions

### Creating Places of Interest
Create a Place of Interest(POI) entry by clicking the appropriate entry, filling in the fields and uploading a suitable photo. 

### Viewing POIs by Category/Creating a category
The POIs may be filtered by a certain category. This app allows the user to create their own list of categories, and list their POIs in each appropriate category. 
To create a category, select the "View by Category" option in your Places List. In this view, you will have the option to create a category. When you have created a category,
go back to your Place List and click the pen icon, this view allows you to edit this POI, and also set a category. Once you have set a POI to a category, you can view it in that
category list.

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
npm install dotenv
```
See layout.hbs for UIkit and Font Awesome initialisation

<br>

To use mongoose and cloudinary, you must setup accounts, and declare your accout information to link the app to them<br>
This app is setup to initialise within a .env file with a layout as below. <br>
To use cookie system, all that is required is the two lines seen below, no account.

```
cookie_name=name
cookie_password=your-password-here

# mongoose database details
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

### v1.2
* User Account Admin
* Place Categories

## Roadmap

### v1.3
* Admin dashboard and analytics
* Location co-ordinates and weather

## Author
Shane Ryan <br />
shanery86@gmail.com
