const Card = require("../models/card");
const OK = require("../error/Ok-status");
const BadRequestError = require("../error/Bad-request-error");
const NotFoundError = require("../error/Not-found-error");
const InternalServerError = require("../error/Internal-server-error");
const ForbiddenError = require("../error/Forbidden-error");

const getCards = (req, res) => {
  Card.find({})
    .then((cards) =>
      res.send({
        data: cards,
      })
    )
    .catch(() =>
      res.status(InternalServerError).send({
        message: "Ошибка по умолчанию",
      })
    );
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({
    name,
    link,
    owner,
  })
    .then((card) => {
      card
        .populate("owner")
        .then((newCard) => res.status(OK).send(newCard))
        .catch(() =>
          res.status(InternalServerError).send({
            message: "Ошибка по умолчанию",
          })
        );
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(BadRequestError).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      } else {
        res.status(InternalServerError).send({
          message: "Ошибка по умолчанию",
        });
      }
    });
};

const removeCard = (req, res) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  Card.findByIdAndRemove({
    owner,
    _id: cardId,
  })
    .then((card) => {
      if (card) {
        res.send({
          message: "Карточка удалена",
        });
      }
      if (cardId.owner.toString() !== req.user._id) {
        throw new ForbiddenError("Вы не можете удалить эту карточку");
      } else {
        res.status(NotFoundError).send({
          message: "Карточка с указанным _id не найдена",
        });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BadRequestError).send({
          message: "Переданы некорректные данные",
        });
      } else {
        res.status(InternalServerError).send({
          message: "Ошибка по умолчанию",
        });
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
