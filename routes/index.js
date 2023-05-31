const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const messageController = require("../controllers/messageController");

router.get("/", messageController.messages_list);
router.get("/sign-up", accountController.account_create_get);
router.post("/sign-up", accountController.account_create_post);
router.get("/login", accountController.login_get);
router.post("/login", accountController.login_post);
router.get("/logout", accountController.logout_get);
router.get("/membership", accountController.membership_get);
router.post("/membership", accountController.membership_post);
router.get("/admin", accountController.admin_get);
router.get("/new-message", messageController.new_message_get);
router.post("/new-message", messageController.new_message_post);

module.exports = router;
