const router = require('express').Router();
const {
  getUsers,
  getUserById,
  updateUserData,
  updateUserAvatar,
  getUser,
} = require('../controllers/users');
const {
  getUserByIdValidation,
  updateUserDataValidation,
  updateUserAvatarValidation,
} = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/me', getUser);
router.get('/:userId', getUserByIdValidation, getUserById);
router.patch('/me', updateUserDataValidation, updateUserData);
router.patch('/me/avatar', updateUserAvatarValidation, updateUserAvatar);

module.exports = router;
