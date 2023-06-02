const Account = require("../models/account");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs/promises");
const path = require("path");

// Sign Up Page
exports.account_create_get = (req, res) => {
  // if user is signed in, redirect to home page
  if (req.user) {
    res.redirect("/");
    return;
  }
  // else, display sign up page
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
  body("username", "Username is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom(async (value) => {
      // check if another username already has this username
      const existingUser = await Account.findOne({ username: value });
      if (existingUser) {
        throw new Error("This username is not available");
      } else {
        return value;
      }
    }),
  body("password", "Password is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.confirm_password) {
        // throw error if passwords do not match
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
        // automatically authenticate user
        passport.authenticate("local", {
          successRedirect: "/",
          failureRedirect: "/login",
        })(req, res);
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.login_get = (req, res) => {
  // if user is signed in, redirect to home page
  if (req.user) {
    res.redirect("/");
    return;
  }
  // else, display sign in page
  res.render("login_form", { title: "Log In" });
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
      failureRedirect: "/login",
    })(req, res);
  },
];

exports.membership_get = async (req, res) => {
  // if user is already a member or is not logged in
  if (!req.user) {
    res.redirect("/login");
    return;
  } else if (req.user.member) {
    res.redirect("/");
    return;
  }
  try {
    // generate random text from uuid dependency
    const code = uuidv4();
    // membership code written in file successfully
    fs.writeFile(path.join(__dirname, "../secret/membership_code.txt"), code);
    res.render("membership_form", {
      title: "Be a member",
      user: req.user,
      code,
    });
  } catch (err) {
    // display with error that the code has expired
    res.render("membership_form", {
      title: "Be a member",
      user: req.user,
      errors: [{ msg: "The previously entered code has expired" }],
    });
  }
};

exports.membership_post = [
  body("secret_code", "You need to enter the generated code")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Secret code cannot be empty")
    .escape()
    .custom(async (value, { req }) => {
      const current_code_data = await fs.readFile(
        path.join(__dirname, "../secret/membership_code.txt"),
        {
          encoding: "utf8",
        }
      );
      if (value !== current_code_data) {
        // throw error if code has changed
        throw new Error("The previously entered code has expired");
      } else {
        return value;
      }
    }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      // if there are errors
      if (!errors.isEmpty()) {
        // display form again with error
        // generate new code from uuid dependency
        const code = uuidv4();
        // membership code written in file successfully
        fs.writeFile(
          path.join(__dirname, "../secret/membership_code.txt"),
          code
        );
        res.render("membership_form", {
          title: "Be a member",
          user: req.user,
          code,
          errors: errors.array(),
        });
        return;
      }

      const user = await Account.findOneAndUpdate(
        { _id: req.user._id },
        { member: true }
      );
      user.save();
      res.redirect("/");
    } catch (err) {
      console.log(err);
      // return next(err);
    }
  },
];

exports.logout_get = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.admin_get = async (req, res) => {
  // if user is a member, admin or not signed in, take appropriate steps
  if (!req.user) {
    res.redirect("/");
    return;
  } else if (!req.user.member) {
    res.redirect("/membership");
    return;
  } else if (req.user.admin) {
    res.redirect("/");
    return;
  }
  try {
    // generate random code from uuid dependency
    const code = uuidv4();
    // write admin code in file successfully
    fs.writeFile(path.join(__dirname, "../secret/admin_code.txt"), code);
    res.render("admin_form", {
      title: "Become An Admin",
      user: req.user,
      code,
    });
  } catch (err) {
    res.render("admin_form", {
      title: "Be An Admin",
      user: req.user,
      errors: [{ msg: "The previously entered code has expired" }],
    });
  }
};

exports.admin_post = [
  body("admin_code", "You need to enter the generated code")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Secret code cannot be empty")
    .escape()
    .custom(async (value, { req }) => {
      const current_code_data = await fs.readFile(
        path.join(__dirname, "../secret/admin_code.txt"),
        {
          encoding: "utf8",
        }
      );
      if (value !== current_code_data) {
        // throw error if code has changed
        throw new Error("The previously entered code has expired");
      } else {
        return value;
      }
    }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      // if there are errors
      if (!errors.isEmpty()) {
        // display form again with error
        // generate new code from uuid dependency
        const code = uuidv4();
        // admin code written in file successfully
        fs.writeFile(path.join(__dirname, "../secret/secret_code.txt"), code);
        res.render("admin_form", {
          title: "Be an Admin",
          user: req.user,
          code,
          errors: errors.array(),
        });
        return;
      }
      const user = await Account.findOneAndUpdate({
        _id: req.user._id,
        admin: true,
      });
      user.save();
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  },
];
