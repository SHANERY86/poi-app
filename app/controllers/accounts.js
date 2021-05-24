const User = require('../models/user');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const Place = require('../models/place');
const sanitizeHtml = require('sanitize-html');
const ImageStore = require("../utils/image-store");
const bcrypt = require('bcrypt');
const saltRounds = 10;


const Accounts = {
    signup: {
        auth: false,
        handler: function(request, h) {
            return h.view("signup");
        }
    },
    loginView: {
        auth: false,
        handler: function(request, h) {
            return h.view("login");
        }
    },
    // login requires an email input, and a string for password, both checked through Joi. Also sets a cookie. When logged in, displays the list of places (places.hbs)
    login: {
        auth: false,
        validate: {
            payload: {
              email: Joi.string().email().required(),
              password: Joi.string().required(),
            },
            options: {
                abortEarly: false,
              },
            failAction: function (request, h, error) {
              return h
                .view("login", {
                  errors: error.details
                })
                .takeover()
                .code(400);
            },
          }, 
        handler: async function(request, h) { 
            const { email, password } = request.payload;         
            let user = await User.findByEmail(email);
            try {
            if (!user) {
                const message = "Email address is not registered";
                throw Boom.unauthorized(message);
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(isMatch){
            request.cookieAuth.set({ id: user.id });
            return h.redirect("/mapview");
          }
            if(!isMatch){
              const message = "Incorrect Username or Password";
            throw Boom.unauthorized(message);
            }
        } catch(err) {
            return h.view("login", { errors: [{ message: err.message }] });
        }
        }
    },
    logout: {
        handler: function(request, h) {
            request.cookieAuth.clear();
            return h.redirect("/");
        }
    },
  //adduser adds a new user through the signup view. checks for appropriate inputs with Joi, when new user is added, displays the view to add their first POI(addplaces.hbs)
    adduser: {
        auth: false,
        validate: {
            payload: {
              name: Joi.string().required(),
              email: Joi.string().email().required(),
              password: Joi.string().required(),
            },
            options: {
                abortEarly: false,
              },
            failAction: function (request, h, error) {
              return h
                .view("signup", {
                  errors: error.details
                })
                .takeover()
                .code(400);
            },
          }, 
        handler: async function(request, h) {
            const payload = request.payload;
            let email = await User.findByEmail(payload.email);
            try {
                if(email){
                    const message = "Email address is already on the system"
                    throw Boom.badData(message);
                }
                const sanitisedName = sanitizeHtml(payload.name);
                const sanitisedPassword = sanitizeHtml(payload.password);
                const hash = await bcrypt.hash(sanitisedPassword, saltRounds);
                if (sanitisedName == "" || sanitisedPassword == ""){
                  const message = "User Input blocked for security reasons"
                  throw Boom.badData(message);
                }
                const newUser = new User({
                    name: sanitisedName,
                    email: payload.email,
                    password: hash
                });
                const user = await newUser.save();
                request.cookieAuth.set({ id: user.id });
                return h.redirect("/addview");
            } catch(err) {
                return h.view("signup", { errors: [{ message: err.message }] });
            }
        }
    },
    // will display the account settings page for this user
    settings: {
      handler: async function (request, h) {
        const userid = request.auth.credentials.id;
        const user = await User.findById(userid).lean();
        return h.view("settings", { user: user });        
      }
    },
    //takes updated settings for this user and saves over the old ones 
    editUser: {
      validate: {
        payload: {
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        },
        options: {
            abortEarly: false,
          },
        failAction: async function (request, h, error) {
          const userid = request.auth.credentials.id;
          const user = await User.findById(userid).lean();
          return h
            .view("settings", { user: user,
              errors: error.details
            })
            .takeover()
            .code(400);
        },
      }, 
      handler: async function(request, h) {
        const userid = request.auth.credentials.id;
        const user = await User.findById(userid)
        const userUpdate = request.payload;
        try {
        const sanitisedName = sanitizeHtml(userUpdate.name);
        const sanitisedPassword = sanitizeHtml(userUpdate.password);
        const hash = await bcrypt.hash(sanitisedPassword, saltRounds);
        if (sanitisedName == "" || sanitisedPassword == ""){
          const message = "User Input blocked for security reasons"
          throw Boom.badData(message);
        }
        user.name = sanitisedName;
        user.email = userUpdate.email;
        user.password = hash;
        await user.save();
        const newUser = await User.findById(userid).lean();
        return h.view("settings", { user: newUser });
      }
      catch (err) {
        const user = await User.findById(userid).lean();
        return h.view("settings", { user: user, errors: [ { message: err.message } ] } );
      }
      }
    },
    //this hardcodes the admin password (for demonstration purposes) for the admin login page
    adminLoginView: {
      auth: false,
      handler: function(request, h) {
        const password = "admin123";
        return h.view("adminlogin", { password: password });
      }
    },
    //when the admin logs in, this will find all current users and the amount of places they have logged on their account and present it in the admindashboard.hbs view
    adminLogin: {
      auth: false,
      handler: async function(request, h) {
        const adminUser = await User.findByEmail('admin@admin.com');
        const password = request.payload.password;
        try{
          adminUser.comparePassword(password);
          request.cookieAuth.set({ id: adminUser.id });
          const users = await User.findAll().lean();
          const places = await Place.placeDb.findAll().lean();
          users.forEach(function(user) {
            var placeCount = 0;
            userIdString = user._id.toString();         
              places.forEach(function(place) {
                placeIdString = place.user.toString();
                if(placeIdString == userIdString) {
                  placeCount += 1;
          }
        });
        user.placeNumber = placeCount;
        }); 
        return h.view("admindashboard", { users: users })
      }
      catch(err) {
        return h.view("adminlogin", { errors: [{ message: err.message }] });
        } 
      }
    }, 
    //this is same as above but when the admin clicks the link to return to dashboard
    adminView: {
      handler: async function(request, h) {
      const users = await User.findAll().lean();
      const places = await Place.placeDb.findAll().lean();
      users.forEach(function(user) {
        var placeCount = 0;
        userIdString = user._id.toString();         
          places.forEach(function(place) {
            placeIdString = place.user.toString();
            if(placeIdString == userIdString) {
              placeCount += 1;
      }
    });
    user.placeNumber = placeCount;
    }); 
      return h.view("admindashboard", { users: users })
      }
    },
    /*when the user wants to delete their account, this will gather their places and categories and delete them, and then delete their account. Will also delete any associated images
    uploaded to cloudinary */
    deleteUser: {
      handler: async function(request, h) {
        const userid = request.params._id;
        const user = await User.findById(userid);
        console.log(user);
        const places = await Place.placeDb.find({ user: user._id });
        places.forEach(async function(place) { 
//          const placeObj = Place.placeDb.find( { _id: place._id });
          const imageId = await ImageStore.getImageId(place.image);
          if(place.image != "https://res.cloudinary.com/djmtnizt7/image/upload/v1616502936/globe_binoc_jdgn3n.png"){
              await ImageStore.deleteImage(imageId);
        }
        console.log("removing place..");
          await place.remove();
        })
        const categories = await Place.categoryDb.find( { user: user._id });
        categories.forEach(async function(category){
          const catObj = Place.categoryDb.find( { _id: category._id });
          await catObj.remove();
        })
        await user.remove();
        return h.redirect("/");
      }
    },
    // this will delete a user and their places and categories when in the admin view Will also delete any associated images uploaded to cloudinary
    adminDeleteUser: {
      handler: async function(request, h) {
        const userid = request.params._id;
        const user = await User.findById(userid);
        const places = await Place.placeDb.find({ user: user._id });
        places.forEach(async function(place) { 
        const imageId = await ImageStore.getImageId(place.image);
        if(place.image != "https://res.cloudinary.com/djmtnizt7/image/upload/v1616502936/globe_binoc_jdgn3n.png"){
          await ImageStore.deleteImage(imageId);
        }
        await place.remove();
        })
        const categories = await Place.categoryDb.find( { user: user._id });
        categories.forEach(async function(category){
          const catObj = Place.categoryDb.find( { _id: category._id });
          await catObj.remove();
        })
        await user.remove();
        return h.redirect("/adminview");
      }      
    }
  }

module.exports = Accounts;