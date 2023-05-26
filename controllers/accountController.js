const Account = require("../models/account");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Sign Up Page
exports.account_create_get = (req, res) => {
  res.render("signup_form", { title: "Sign Up" });
};

exports.account_create_post = [
  // validate and sanitize fields
  body("first_name", "First Name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("last_name", "Last Name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Username is required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.confirm_password) {
        // trow error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),
  body("confirm_password", "Password is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  async (req, res, next) => {
    const { first_name, last_name, username, password } = req.body;
    try {
      const errors = validationResult(req);
      // if there are errors
      if (!errors.isEmpty()) {
        // display form again with error
        res.render("signup_form", { title: "Sign Up", errors: errors.array() });
        return;
      }
      // create user with bcrypt password in the database
      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        const account = new Account({
          firstName: first_name,
          lastName: last_name,
          username: username,
          password: hashedPassword,
          member: false,
          admin: false,
        });
        await account.save();
        res.redirect("/");
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.login_get = (req, res) => {
  res.render("login_form");
};

exports.login_post = [
  body("username", "Username is required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password is required").trim().isLength({ min: 1 }).escape(),
  (req, res) => {
    const errors = validationResult(req);
    // if there are errors
    if (!errors.isEmpty()) {
      // display form again with error
      res.render("login_form", { title: "Login", errors: errors.array() });
      return;
    }
    // you cannot call passport.authenticate by yourself
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/",
    })(req, res);
  },
];

exports.membership_get = (req, res) => {
  // generate random text from uuid dependency
  const code = uuidv4();
  res.render("membership_form", { title: "Be a member", user: req.user, code });
};

exports.membership_post = (req, res) => {
  // attach res.locals.currentUser = req.user;
  // get a random text too be inputed in form to become a member
};

exports.logout_get = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
