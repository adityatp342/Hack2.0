const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MONGOURI, JWT_SECRET } = require("../config/keys.js");

router.post("/api/signup", (req, res) => {
  // const { name, email, password, role} = req.body;
  var { name, email, phone_number, password, role } = req.body;
  if (!name || !email || !password || !phone_number) {
    return res.status(422).json({ error: "Please add all the fields..." });
  }

  USER.findOne({ $or: [{ email: email }] }).then((savedUser) => {
    if (savedUser) {
      return res
        .status(422)
        .json({ error: "User already exist with that email..." });
    }
    bcrypt.hash(password, 12).then((hashedPassword) => {
      if (role === "") {
        role = "user";
      }
      const user = new USER({
        name,
        email,
        phone_number,
        password: hashedPassword,
        role: role,
      });

      user
        .save()
        .then((user) => {
          res.json({ message: "Registered successfully..." });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
});

router.post("/api/signin", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please add email and password..." });
  }

  USER.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((match) => {
        if (match) {
          // return res.status(200).json({ message: "Signed in Successfully..." })
          const token = jwt.sign({ _id: savedUser.id }, JWT_SECRET);
          const { _id, name, email, role } = savedUser;

          res.json({ token, user: { _id, name, email, role } });

          
        } else {
          return res.status(422).json({ error: "Invalid password" });
        }
      })
      .catch((err) => console.log(err));
  });
});

router.get("/api/allusers/:id", async (req, res, next) => {
  try {
    const users = await USER.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "name",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
