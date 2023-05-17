const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("layout", {
    title: "The Exclusive Club",
    p: "Layout Page would be extended by other pug pages",
  });
});

router.get("/sign-up", (req, res) => {
  res.send("Sign Up Page GET PAGE to be implemented");
});

module.exports = router;
