const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { URL } = require("../utils/utils");

const {
  getCards,
  createCard,
  removeCard,
  likedCard,
  dislikedCard,
} = require("../controllers/cards");

router.get("/cards", getCards);

router.post("/cards", celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(URL),
  }),
}), createCard);

router.delete("/cards/:cardId",celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
}), removeCard);

router.put("/cards/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
}), likedCard);

router.delete("/cards/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
}), dislikedCard);

module.exports = router;