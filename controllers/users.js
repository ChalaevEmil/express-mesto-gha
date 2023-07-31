const mongoose = require("mongoose");
const User = require("../models/user");
const OK = require("../error/Ok-status");
const BadRequestError = require("../error/Bad-request-error");
const NotFoundError = require("../error/Not-found-error");
const InternalServerError = require("../error/Internal-server-error");
const ConflictError = require("../error/Conflict-error");
const jwt = require("jsonwebtoken");

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

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
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
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError("Пользователь с таким email уже существует"));
      } else if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            "Переданы некорректные данные при создании пользователя"
          )
        );
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
      res.cookie("jwt", token, {
        httpOnly: true,
      });
      res.status(OK).send({ token });
    })
    .catch(next);
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
