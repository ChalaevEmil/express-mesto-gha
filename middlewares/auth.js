const jwt = require("jsonwebtoken");
const { NODE_ENV, JWT_SECRET } = process.env;
const UnauthorizedError = require("../error/Unauthorized-error");

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let playload;
  if (!token) {
    next(new UnauthorizedError("Авторизируйтесь"));
  }
  try {
    playload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret"
    );
    req.user = playload;
  } catch (err) {
    next(new UnauthorizedError("Авторизируйтесь"));
  }
  next();
};
