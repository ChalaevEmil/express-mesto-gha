const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../error/Unauthorized-error");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new UnauthorizedError("Авторизируйтесь");
  }
  const token = authorization.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, "some-secret-key");
  } catch (err) {
    throw new UnauthorizedError("Авторизируйтесь");
  }
  req.user = payload;
  next();
  return null;
};
