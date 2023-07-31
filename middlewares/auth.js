const token = require("jsonwebtoken");
const { NODE_ENV, JWT_SECRET } = process.env;
const UnauthorizedError = require("../error/Unauthorized-error");

module.exports = (req, res, next) => {
  const { jwt } = req.cookies;
  if (!jwt) {
    next(new UnauthorizedError("Авторизируйтесь"));
    return;
  }
  let payload;
  try {
    payload = token.verify(
      jwt,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret"
    );
  } catch (err) {
    next(new UnauthorizedError("Авторизируйтесь"));
    return;
  }
  req.user = payload;
  next();
};
