users = [];
currentUser = {};

const Accounts = {
    signup: {
        handler: function(request, h) {
            return h.view("signup");
        }
    },
    loginView: {
        handler: function(request, h) {
            return h.view("login");
        }
    },
    login: {
        handler: function(request, h) {
            var auth = false;
            const userEntry = request.payload;
            userPassword = userEntry.password;          
            users.forEach(function(user) {
                if ( userEntry.email == user.email && userPassword == user.password) {
                    auth = true;
                }
            });
            if ( auth ) {
                currentUser = userEntry;
                return h.view("addplaces");
            }
            else {
                return h.redirect("/loginView");
            } 
        }
        },
    logout: {
        handler: function(request, h) {
            currentUser = {};
            return h.redirect("/");
        }
    },
    adduser: {
        handler: function(request, h) {
            const newUser = request.payload;
            currentUser = newUser;
            users.push({
                Name: newUser.name,
                email: newUser.email,
                password: newUser.password
            });
            return h.redirect("/addview");
        }
    }
}

module.exports = Accounts;