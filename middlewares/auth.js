const token = require('jsonwebtoken');
const UnauthorizedError = require("../error/Unauthorized-error");
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { jwt } = req.cookies;
  if (!jwt) {
    next(new UnauthorizedError('Пользователь не авторизован'));
    return;
  }
  let payload;
  try {
    payload = token.verify(jwt, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new UnauthorizedError('Пользователь не авторизован'));
    return;
  }
  req.user = payload;
  next();
};
