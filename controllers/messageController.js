// display all messages
exports.messages_list = (req, res) => {
  res.render("home", {
    title: "Messages",
    p: "List of messages NOT IMPLEMENTED",
    user: req.user,
  });
};
