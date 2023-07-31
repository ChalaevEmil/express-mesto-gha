const router = require("express").Router();
const {
  getCards,
  createCard,
  removeCard,
  likedCard,
  dislikedCard,
} = require("../controllers/cards");
const {
  createCardValidation,
  cardIdValidation,
} = require("../middlewares/validation");

router.get("/cards", getCards);
router.post("/cards", createCardValidation, createCard);
router.delete("/cards/:cardId", cardIdValidation, removeCard);
router.put("/cards/:cardId/likes", likedCard);
router.delete("/cards/:cardId/likes", cardIdValidation, dislikedCard);

module.exports = router;
