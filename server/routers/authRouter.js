const express = require("express");
const validateForm = require("../controllers/validateForm");
const router = express.Router();
const {
  handleLogin,
  attemptLogin,
  attemptSignUp,
} = require("../controllers/authController.js");
const { rateLimiter } = require("../controllers/rateLimiter");

router
  .route("/login")
  .get(handleLogin) // check session
  .post(validateForm, rateLimiter, attemptLogin);

router.post("/sign-up", validateForm, rateLimiter, attemptSignUp);

module.exports = router;
