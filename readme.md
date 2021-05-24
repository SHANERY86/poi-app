# Places of Interest App v1.6

## Description
This app allows a users to log places in the world that they are interested in, and share these places with other people around the world. The users can interact through comments and reviews to share their experiences. This is an assigment required for the completion of the Enterprise Web Development module in the HDip in Computer Science 2020 course at Waterford Institute of Technology.

<br />

## Instructions

### Creating Places of Interest
Create a Place of Interest(POI) entry by clicking the add place icon, filling in the fields, finding your place roughly on the map and uploading a suitable photo. 

### Viewing POIs by Category/Creating a category
The POIs may be filtered by a certain category. This app allows the user to create their own list of categories, and list their POIs in each appropriate category. 
To create a category, select the "View by Category" option in your Places List. In this view, you will have the option to create a category. When you have created a category,
go back to your Place List and click the pen icon on a POI, this view allows you to edit this POI, and also set a new category. 

### Weather Report
When you have set accurate GPS co-ordinates for a POI, you will recieve a weather report at the bottom of the POI. GPS co-ordinates can be optionally input when creating a POI or added later in the edit POI menu.

### Social Features
See POIs that other users and have interacted with by using the Social Map, Social List and Notice Board. Click into each POI, and see more information about them. Go and visit them, and then leave your opinion by submitting you own rating and review. Have a discussion in the comments section.

## Admin functionality
The admin dashboard can be accessed by entering '/admin' at the end of the app url in the browser. The admin password is pre-programmed into the password field for demo purposes.
Inside the admin dashboard, an admin user can delete users, and also view their place lists to delete or amend any information to control the content displayed on the app


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

#Open weather
apiKey=your-api-key
```

## Updates

### v1.1
* Authentation/Cookies (@hapi/cookie)
* Images (Upload/View) (cloudinary)
* Update/Delete POI.

### v1.2
* User Account Admin
* Place Categories

### v1.3
* Admin dashboard and analytics
* Location co-ordinates and weather

### v1.4
* Exposed basic API endpoints
* Created basic Unit Tests
* Implemented sanitisation of inputs

### v1.5
* Social features
* Rating and Review
* Comments

### v1.6
* Map features
* Notice Board

## Roadmap
* To Be Continued...

## Author
Shane Ryan <br />
shanery86@gmail.com
