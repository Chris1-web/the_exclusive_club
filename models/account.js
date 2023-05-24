const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  firstName: { type: String, required: true, minLength: 1, maxLength: 100 },
  lastName: { type: String, required: true, minLength: 1, maxLength: 100 },
  username: { type: String, required: true, minLength: 1, maxLength: 100 },
  password: { type: String, required: true, minLength: 1, maxLength: 100 },
  member: { type: Boolean, default: false, required: true },
  admin: { type: Boolean, default: false, required: true },
});

module.exports = mongoose.model("Account", AccountSchema);
