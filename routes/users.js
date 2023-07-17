const router = require("express").Router();
const {
  getUsers,
  getUserById,
  createNewUser,
  updateUserData,
  updateUserAvatar,
} = require("../controllers/users");

router.get("/users", getUsers);
router.get("/users/:userId", getUserById);
router.post("/users", createNewUser);
router.patch("/users/me", updateUserData);
router.patch("/users/me/avatar", updateUserAvatar);

module.exports = router;
