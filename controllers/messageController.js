const { body, validationResult } = require("express-validator");
const Message = require("../models/message");

// display all messages
exports.messages_list = async (req, res, next) => {
  try {
    const messages = await Message.find({}).populate("author");
    res.render("home", { title: "Messages", user: req.user, messages });
  } catch (err) {
    next(err);
  }
};

exports.new_message_get = (req, res) => {
  if (!req.user) {
    res.redirect("/");
    return;
  }
  res.render("message_form", { user: req.user });
};

exports.new_message_post = [
  body("title", "Title is required").trim().isLength({ min: 1 }).escape(),
  body("text", "Text is required").trim().isLength({ min: 1 }).escape(),
  async (req, res) => {
    const { title, text } = req.body;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render("message_form", { user: req.user, errors: errors.array() });
        return;
      }
      // create new message in database
      const message = new Message({
        title,
        text,
        date: new Date(),
        author: req.user._id,
      });
      await message.save();
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  },
];
