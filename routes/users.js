const router = require("express").Router();
const {
  getUsers,
  getUserById,
  updateUserData,
  updateUserAvatar,
  getUser,
} = require("../controllers/users");
const {
  getUserByIdValidation,
  updateUserDataValidation,
  updateUserAvatarValidation,
} = require("../middlewares/validation");

router.get("/users", getUsers);
router.get("/users/me", getUser);
router.get("/users/:userId", getUserByIdValidation, getUserById);
router.patch("/users/me", updateUserDataValidation, updateUserData);
router.patch("/users/me/avatar", updateUserAvatarValidation, updateUserAvatar);

module.exports = router;
