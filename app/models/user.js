const Mongoose = require("mongoose");
const Boom = require("@hapi/boom")
const Schema = Mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String
});

const categorySchema = new Schema({
  name: String,
  user: {
      type: Schema.Types.ObjectId,
      ref: "User",
  }
});

userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email });
};

userSchema.methods.comparePassword = function(candidatePassword) {
    const isMatch = this.password === candidatePassword;
    if (!isMatch) {
        throw Boom.unauthorized('Password mismatch');
    }
    return this;
  };

module.exports = Mongoose.model("User", userSchema);