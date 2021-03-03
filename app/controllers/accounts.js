const Accounts = {
    signup: {
        handler: function(request, h) {
            return h.view("signup");
        }
    },
    login: {
        handler: function(request, h) {
            return h.view("login");
        }
    }
}

module.exports = Accounts;