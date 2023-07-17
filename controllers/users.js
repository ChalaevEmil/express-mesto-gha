const mongoose = require("mongoose");
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) =>
      res.send({
        data: users,
      })
    )
    .catch(() =>
      res.status(INTERNAL_SERVER_ERROR).send({
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
        res.status(NOT_FOUND).send({
          message: "Пользователь по указанному _id не найден",
        });
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(BAD_REQUEST).send({
          message: "Переданы некорректные данные пользователя",
        });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({
          message: "Ошибка по умолчанию",
        });
      }
    });
};

const createNewUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({
    name,
    about,
    avatar,
  })
    .then((user) =>
      res.send({
        data: user,
      })
    )
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(BAD_REQUEST).send({
          message: "Переданы некорректные данные при создании пользователя",
        });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({
          message: "Ошибка по умолчанию",
        });
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
        res.status(NOT_FOUND).send({
          message: "Пользователь не найден",
        });
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(BAD_REQUEST).send({
          message: "Переданы некорректные данные пользователя.",
        });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({
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

module.exports = {
  getUsers,
  getUserById,
  createNewUser,
  updateUserData,
  updateUserAvatar,
};
