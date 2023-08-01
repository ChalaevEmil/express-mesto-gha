const express = require("express");
const mongoose = require("mongoose");
const NotFoundError = require("./error/Not-found-error");
const { PORT = 3000 } = process.env;
const bodyParser = require("body-parser");
const auth = require("./middlewares/auth");
const handleError = require("./middlewares/handleError");
const { errors } = require("celebrate");
const { login, createNewUser } = require("./controllers/users");
const {
  createNewUserValidation,
  loginValidation,
} = require("./middlewares/validation");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/users");
const cardRouter = require("./routes/cards");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", auth, userRouter);
app.use("/cards", auth, cardRouter);
app.post("/signin", loginValidation, login);
app.post("/signup", createNewUserValidation, createNewUser);

app.use(auth);
app.use(errors());
app.use(handleError);

app.use("*", (req, res) => {
  res.status(NotFoundError).send({ message: "Страница не найдена" });
});
mongoose.connect("mongodb://127.0.0.1:27017/mestodb");

app.listen(PORT, () => console.log("Локальный сервер запущен"));
