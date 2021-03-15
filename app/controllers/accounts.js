const User = require('../models/user');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

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
            return h.view("addplaces");
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
    }
}

module.exports = Accounts;