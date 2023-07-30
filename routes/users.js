const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getUsers,
  getUserById,
  updateUserData,
  updateUserAvatar,
  getUser,
} = require("../controllers/users");
const { URL } = require("../utils/utils");

router.get("/users", getUsers);

router.get('/users/me', getUser);

router.get("/users/:userId", celebrate({
  params: Joi.object().keys({
    _id: Joi.string().required().length(24).hex(),
  }),
}), getUserById);

router.patch("/users/me", celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUserData);

router.patch("/users/me/avatar", celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(URL),
  }),
}), updateUserAvatar);

module.exports = router;