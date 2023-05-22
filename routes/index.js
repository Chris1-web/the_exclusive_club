const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const messageController = require("../controllers/messageController");

router.get("/", messageController.messages_list);
router.get("/sign-up", accountController.account_create_get);
router.post("/sign-up", accountController.account_create_post);

module.exports = router;
