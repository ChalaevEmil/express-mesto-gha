const router = require("express").Router();
const {
  getCards,
  createCard,
  removeCard,
  likedCard,
  dislikedCard,
} = require("../controllers/cards");

router.get("/cards", getCards);
router.post("/cards", createCard);
router.delete("/cards/:cardId", removeCard);
router.put("/cards/:cardId/likes", likedCard);
router.delete("/cards/:cardId/likes", dislikedCard);

module.exports = router;
