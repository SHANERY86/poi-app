const User = require('../models/user');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const Place = require('../models/place');

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
            user.comparePassword(password);
            request.cookieAuth.set({ id: user.id });
            return h.redirect("/places");
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
                const newUser = new User({
                    name: payload.name,
                    email: payload.email,
                    password: payload.password
                });
                const user = await newUser.save();
                request.cookieAuth.set({ id: user.id });
                return h.redirect("/addview");
            } catch(err) {
                return h.view("signup", { errors: [{ message: err.message }] });
            }
        }
    },
    settings: {
      handler: async function (request, h) {
        const userid = request.auth.credentials.id;
        const user = await User.findById(userid).lean();
        return h.view("settings", { user: user });        
      }
    },
    editUser: {
      handler: async function(request, h) {
        const userid = request.auth.credentials.id;
        const user = await User.findById(userid);
        const userUpdate = request.payload;
        user.name = userUpdate.name;
        user.email = userUpdate.email;
        user.password = userUpdate.password;
        await user.save();
        const newUser = await User.findById(userid).lean();
        return h.view("settings", { user: newUser });
      }
    },
    adminLoginView: {
      auth: false,
      handler: function(request, h) {
        const password = "admin123";
        return h.view("adminlogin", { password: password });
      }
    },
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
    deleteUser: {
      handler: async function(request, h) {
        const userid = request.params._id;
        const user = await User.findById(userid);
        const places = await Place.placeDb.find({ user: user._id });
        places.forEach(async function(place) { 
          const placeObj = Place.placeDb.find( { _id: place._id });
          await placeObj.remove();
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
    adminDeleteUser: {
      handler: async function(request, h) {
        const userid = request.params._id;
        const user = await User.findById(userid);
        const places = await Place.placeDb.find({ user: user._id });
        places.forEach(async function(place) { 
        const placeObj = Place.placeDb.find( { _id: place._id });
        await placeObj.remove();
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
/*    placeCount: async function(user) {
          const places = await Place.placeDb.findAll().lean();
         users.forEach(function(user) { 
            var placeCount = 0; 
            userIdString = user._id.toString();         
              places.forEach(function(place) {
                placeIdString = place.user.toString();
                if(placeIdString == userIdString) {
                  placeCount += 1;
                }
                return placeCount;
  });
} */
  }

module.exports = Accounts;