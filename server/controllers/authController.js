const pool = require("../db.js");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.handleLogin = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.json({ loggedIn: false });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      res.json({ loggedIn: false });
      return;
    } else {
    res.json({ loggedIn: true, token });
    }
  });
};

module.exports.attemptLogin = async (req, res) => {
  const potentialLogin = await pool.query(
    "SELECT id, username, passhash, userid FROM users u WHERE u.username=$1",
    [req.body.username]
  );

  if (potentialLogin.rowCount > 0) {
    const isSamePass = await bcrypt.compare(
      req.body.password,
      potentialLogin.rows[0].passhash
    );
    if (isSamePass) {
      //login
      jwt.sign(
        {
          username: req.body.username,
          id: potentialLogin.rows[0].id,
          userid: potentialLogin.rows[0].userid,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2min" },
        (err, token) => {
          if (err) {
            res.json({
              loggedIn: false,
              status: "Something went wrong. Try again later!",
            });
            return;
          }
          res.json({ loggedIn: true, token });
        }
      );
    } else {
      res.json({ loggedIn: false, status: "Wrong username or password!" });
      console.log("not good");
    }
  } else {
    console.log("not good");
    res.json({ loggedIn: false, status: "Wrong username or password!" });
  }
};

module.exports.attemptSignUp = async (req, res) => {
  const exitingUser = await pool.query(
    "SELECT username from users WHERE username=$1",
    [req.body.username]
  );

  if (exitingUser.rowCount === 0) {
    //register
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUserQuery = await pool.query(
      "INSERT INTO users(username, passhash, userid) values($1,$2,$3) RETURNING id, username, userid",
      [req.body.username, hashedPass, uuidv4()]
    );
    jwt.sign(
      {
        username: req.body.username,
        id: newUserQuery.rows[0].id,
        userid: newUserQuery.rows[0].userid,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2min" },
      (err, token) => {
        if (err) {
          res.json({
            loggedIn: false,
            status: "Something went wrong. Try again later!",
          });
          return;
        }
        res.json({ loggedIn: true, token });
      }
    );
  } else {
    res.json({ loggedIn: false, status: "Username taken!" });
  }
};
