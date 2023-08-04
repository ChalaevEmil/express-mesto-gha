const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const BadRequestError = require("../error/Bad-request-error");
const NotFoundError = require("../error/Not-found-error");
const ConflictError = require("../error/Conflict-error");
const UnauthorizedError = require("../error/Unauthorized-error");

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({
          data: user,
        });
      } else {
        next(new NotFoundError("Пользователь по указанному _id не найден"));
      }
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Переданы некорректные данные пользователя"));
      } else {
        next(err);
      }
    });
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(next);
};

const createNewUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) =>
      res.status(201).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      })
    )
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError("Пользователь с таким email уже существует"));
      } else if (err.name === "ValidationError") {
        next(new BadRequestError("Введены некорректные данные"));
      } else {
        next(err);
      }
    });
};

const userUpdate = (req, res, updateData) => {
  User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) {
        res.send({
          data: user,
        });
      } else {
        res.status(NotFoundError).send({
          message: "Пользователь не найден",
        });
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(BadRequestError).send({
          message: "Переданы некорректные данные пользователя.",
        });
      } else {
        next(err);
      }
    });
};

const updateUserData = (req, res) => {
  const { name, about } = req.body;
  userUpdate(req, res, { name, about });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  userUpdate(req, res, { avatar });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, "some-secret-key", {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      next(new UnauthorizedError(err.message));
    });
};

module.exports = {
  getUsers,
  getUserById,
  createNewUser,
  updateUserData,
  updateUserAvatar,
  login,
  getUser,
};
