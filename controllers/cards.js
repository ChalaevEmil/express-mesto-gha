const mongoose = require("mongoose");
const Card = require("../models/card");
const OK = require("../error/Ok-status");
const InternalServerError = require("../error/Internal-server-error");
const NotFoundError = require("../error/Not-found-error");
const BadRequestError = require("../error/Bad-request-error");
const ForbiddenError = require("../error/Forbidden-error");

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((newCard) => res.status(OK).send(newCard))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(
          new BadDataError("Переданы некорректные данные при создании карточки")
        );
      } else {
        next(err);
      }
    });
};

const removeCard = (req, res, next) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        next(new NotFoundError("Карточка с указанным _id не найдена"));
      }
      if (String(card.owner) !== owner) {
        next(new ForbiddenError("Вы не можете удалить чужую карточку"));
      }
      return Card.findByIdAndRemove(cardId)
        .then((card) => res.status(OK).send({ data: card }))
        .catch(next);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError("Переданы некорректные данные."));
      } else {
        next(err);
      }
    });
};

const likedCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $addToSet: {
        likes: req.user._id,
      },
    },
    {
      new: true,
    }
  )
    .then((card) => {
      if (card) {
        res.send({
          data: card,
        });
      } else {
        res.status(NotFoundError).send({
          message: "Передан несуществующий _id карточки",
        });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BadRequestError).send({
          message: "Переданы некорректные данные для постановки лайка",
        });
      } else {
        res.status(InternalServerError).send({
          message: "Ошибка по умолчанию",
        });
      }
    });
};

const dislikedCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $pull: {
        likes: req.user._id,
      },
    },
    {
      new: true,
    }
  )
    .then((card) => {
      if (card) {
        res.send({
          data: card,
        });
      } else {
        res.status(NotFoundError).send({
          message: "Передан несуществующий _id карточки",
        });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BadRequestError).send({
          message: "Переданы некорректные данные для снятия лайка",
        });
      } else {
        res.status(InternalServerError).send({
          message: "Ошибка по умолчанию",
        });
      }
    });
};

module.exports = { getCards, createCard, removeCard, likedCard, dislikedCard };
