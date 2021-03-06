const Mongoose = require("mongoose");
const Boom = require("@hapi/boom")
const Schema = Mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String
});

userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email });
};

userSchema.statics.findAll = function() {
  return this.find( { email : { $nin: [ 'admin@admin.com' ] } } );
}

userSchema.methods.comparePassword = function(candidatePassword) {
    const isMatch = this.password === candidatePassword;
    if (!isMatch) {
        throw Boom.unauthorized('Password mismatch');
    }
    return this;
  };

module.exports = Mongoose.model("User", userSchema);