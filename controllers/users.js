const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const BadRequestError = require("../error/Bad-request-error");
const NotFoundError = require("../error/Not-found-error");
const InternalServerError = require("../error/Internal-server-error");
const ConflictError = require("../error/Conflict-error");
const UnauthorizedError = require("../error/Unauthorized-error");

const getUsers = (req, res) => {
  User.find({})
    .then((users) =>
      res.send({
        data: users,
      })
    )
    .catch(() => next(new InternalServerError("Ошибка по умолчанию")));
};
const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({
          data: user,
        });
      } else {
        res.status(NotFoundError).send({
          message: "Пользователь по указанному _id не найден",
        });
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(BadRequestError).send({
          message: "Переданы некорректные данные пользователя",
        });
      } else {
        res.status(InternalServerError).send({
          message: "Ошибка по умолчанию",
        });
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
  bcrypt.hash(password, 10, (error, hash) => {
    if (error) {
      next(new InternalServerError("Произошла ошибка"));
      return;
    }
    User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) =>
        res.status(201).send({
          data: {
            name: user.name,
            about: user.about,
            email: user.email,
            avatar: user.avatar,
          },
        })
      )
      .catch((err) => {
        if (err.name === "ValidationError") {
          next(
            new BadRequestError(
              "Переданы некорректные данные при создании пользователя"
            )
          );
        } else if (err.code === 11000) {
          next(new ConflictError("Пользователь с таким email уже существует"));
        } else {
          next(err);
        }
      });
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
        res.status(InternalServerError).send({
          message: "Ошибка по умолчанию",
        });
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
