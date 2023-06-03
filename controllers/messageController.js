const { body, validationResult } = require("express-validator");
const Message = require("../models/message");

// display all messages
exports.messages_list = async (req, res, next) => {
  const { page } = req.query;
  const options = {
    page: parseInt(page, 10) || 1,
    limit: 3,
    sort: { date: -1 },
    populate: "author",
  };
  Message.paginate({}, options).then((results, err) => {
    if (err) {
      next(err);
    }
    //Pass the totalpages number to pug along with the result
    res.render("home", {
      title: "Messages",
      user: req.user,
      messages: results.docs,
      page_count: results.totalPages,
      current_page: results.page,
    });
  });
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
  async (req, res, next) => {
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
      next(err);
    }
  },
];

exports.delete_message_get = async (req, res, next) => {
  // if user is not signed in or is not an admin
  if (!req.user || !req.user.admin) {
    res.redirect("/");
  }
  try {
    const { messageid } = req.params;
    const message = await Message.find({
      _id: messageid,
      author: req.user._id,
    });
    if (message.length !== 0) {
      res.render("message_delete_form", {
        title: "Delete Message",
        messageid,
      });
      return;
    } else {
      res.redirect("/");
    }
  } catch (err) {
    next(err);
  }
};

exports.delete_message_post = [
  body("message_id", "Invalid Page").trim().isLength({ min: 1 }).escape(),
  async (req, res) => {
    const { message_id } = req.body;
    if (!req.user || !req.user.admin) {
      res.redirect("/");
    }
    try {
      // delete message
      await Message.deleteOne({ _id: message_id });
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

exports.error_get = (req, res) => {
  res.render("error", { title: "404 Error" });
};
