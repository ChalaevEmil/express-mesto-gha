const Card = require("../models/card");
const {
  OK,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const getCards = (req, res) => {
  Card.find({})
    .then((cards) =>
      res.send({
        data: cards,
      })
    )
    .catch(() =>
      res.status(INTERNAL_SERVER_ERROR).send({
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
      card.populate('owner')
        .then((newCard) => res.status(OK).send(newCard))
        .catch(() =>
          res.status(INTERNAL_SERVER_ERROR).send({
            message: "Ошибка по умолчанию",
          })
        );
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(BAD_REQUEST).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({
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
          message: 'Карточка удалена',
        });
      } else {
        res.status(NOT_FOUND).send({
          message: 'Карточка с указанным _id не найдена',
        });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({
          message: "Переданы некорректные данные",
        });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({
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
        res.status(NOT_FOUND).send({
          message: "Передан несуществующий _id карточки",
        });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({
          message: "Переданы некорректные данные для постановки лайка",
        });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({
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
        res.status(NOT_FOUND).send({
          message: "Передан несуществующий _id карточки",
        });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({
          message: "Переданы некорректные данные для снятия лайка",
        });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({
          message: "Ошибка по умолчанию",
        });
      }
    });
};

module.exports = { getCards, createCard, removeCard, likedCard, dislikedCard };
