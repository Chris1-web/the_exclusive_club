const { body, validationResult } = require("express-validator");

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
  (req, res) => {
    const errors = validationResult(req);
    // if there are errors
    if (!errors.isEmpty()) {
      // display form again with error
      res.render("signup_form", { title: "Sign Up", errors: errors.array() });
      return;
    }
    // create user with bcrypt password in the database
    res.send(
      `All fields have been filled ${(req.body.first_name, req.body.password)}`
    );
  },
];
