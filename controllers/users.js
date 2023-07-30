const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, NODE_ENV } = process.env;
const OK = require("../error/Ok-status");
const BadRequestError = require("../error/Bad-request-error");
const NotFoundError = require("../error/Not-found-error");
const InternalServerError = require("../error/Internal-server-error");
const ConflictError = require("../error/Conflict-error");

const getUsers = (req, res) => {
  User.find({})
    .then((users) =>
      res.send({
        data: users,
      })
    )
    .catch(() =>
      res.status(InternalServerError).send({
        message: "Ошибка по умолчанию",
      })
    );
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
    .then((user) => {
      const dataUser = user.toObject();
      delete dataUser.password;
      res.status(OK).send(dataUser);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError("Переданы некорректные данные"));
      } else if (err.code === 11000) {
        next(new ConflictError("Данный email уже зарегистрирован"));
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
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
        { expiresIn: "7d" }
      );
      res.cookie("jwt", token);
      res.status(OK).send({ message: "Успешный вход" });
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        next(new NotFoundError("Пользователь по указанному id не найден"));
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError("Переданы некорректные данные"));
      } else {
        next(err);
      }
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
