const express = require("express");
const passport = require("passport");
const router = express.Router();
const accountController = require("../controllers/accountController");
const messageController = require("../controllers/messageController");

router.get("/", messageController.messages_list);
router.get("/sign-up", accountController.account_create_get);
router.post("/sign-up", accountController.account_create_post);
router.get("/login", accountController.login_get);
router.post(
  "/login",
  passport.authenticate("local", { successRedirect: "/", failureRedirect: "/" })
);

module.exports = router;
