const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

// imported routes
const indexRouter = require("./routes/index");
const Account = require("./models/account");

const app = express();
const port = 3000;

// set up mongoose connection
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URL;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// passport middleware
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await Account.findOne({ username: username });
      if (!user) return done(null, false, { message: "Incorrect Username" });
      bcrypt.compare(password, user.password, (req, res) => {
        if (res) {
          // passwords match, log in user
          return done(null, user);
        } else {
          // passwords do not match
          return done(null, false, { message: "Incorrect Password" });
        }
      });
    } catch (err) {
      done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await Account.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// passport
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
