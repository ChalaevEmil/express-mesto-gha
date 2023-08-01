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

router.get("/", getCards);
router.post("/", createCardValidation, createCard);
router.delete("/:cardId", cardIdValidation, removeCard);
router.put("/:cardId/likes", likedCard);
router.delete("/:cardId/likes", cardIdValidation, dislikedCard);

module.exports = router;
