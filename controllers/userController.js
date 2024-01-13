const User = require('../models/user');
const {body, validationResult} = require('express-validator');
const {createHash} = require('../helpers/authentication');
const passport = require('passport');
const { flash } = require('express-flash');


exports.sign_up_get = (req,res,next)=>{
    return res.render("sign-up-form", {
        title: "Welcome to sign up form",
    });
};

exports.sign_up_post = [
    body("username")
      .trim()
      .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (user) {
          return await Promise.reject("Username already taken");
        }
        return true;
      })
      .isLength({ min: 4, max: 20 })
      .withMessage("Username is required (4-20 characters) ")
      .escape(),

    body('email')
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        return await Promise.reject("Email already taken");
      }
      return true;
    })
    .isEmail().withMessage('Not a valid e-mail address'),

    body("password", "Password should be atleast 6 characters long")
      .trim()
      .isLength({ min: 6 })
      .escape(),

    // body("confirmPassword").custom((value, { req }) => {
    //   if (value !== req.body.password) {
    //     throw new Error("Passwords do not match");
    //   }
    //   return true;
    // }),

    async (req, res, next) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        const user = new User({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
        });
        return res.render("sign-up-form", {
          title: "Create account",
          user: user,
          errors: errors.array(),
        });
      }
  
      try {
        const passwordHash = await createHash(req.body.password);
        const user = await new User({
          username: req.body.username,
          password: passwordHash,
          email: req.body.email,
        }).save();
  
        await req.login(user, (err) => {
          if (err) return next(err);
          return res.redirect("/");
        });
      } catch (err) {
        return next(err);
      }
    },
];

exports.log_in_get = (req,res,next)=>{
    return res.render("login-form", {
        title: "Log In",
        errors: req.flash("SignUpMessage"),
    })
};

exports.log_in_post = passport.authenticate(
    "local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    }
)



exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        return res.redirect("/");
    })
};