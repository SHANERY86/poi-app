users = [];


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
        handler: function(request, h) {
            var check = false;
            const userEntry = request.payload;
            userPassword = userEntry.password;          
            users.forEach(function(user) {
                if ( userEntry.email == user.email && userPassword == user.password) {
                    check = true;
                }
            });
            if ( check ) {
                request.cookieAuth.set({ id: userEntry.email });
                return h.view("addplaces");
            }
            else {
                return h.redirect("/loginView");
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
        handler: function(request, h) {
            const newUser = request.payload;
            users.push({
                Name: newUser.name,
                email: newUser.email,
                password: newUser.password
            });
            request.cookieAuth.set({ id: newUser.email });
            return h.redirect("/addview");
        }
    }
}

module.exports = Accounts;