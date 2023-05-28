const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, minLength: 1, maxLength: 100 },
  text: { type: String, required: true, minLength: 1 },
  date: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "Account", required: true },
});

module.exports = mongoose.model("Message", MessageSchema);
