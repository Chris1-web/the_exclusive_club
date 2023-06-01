const mongoosePaginate = require("mongoose-paginate-v2");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, minLength: 1, maxLength: 100 },
  text: { type: String, required: true, minLength: 1 },
  date: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "Account", required: true },
});

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

MessageSchema.virtual("message_date").get(function () {
  return `${
    months[this.date.getMonth() + 1]
  } ${this.date.getDate()}, ${this.date.getFullYear()} ${this.date.getHours()}:${this.date.getMinutes()}`;
});

MessageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Message", MessageSchema);
