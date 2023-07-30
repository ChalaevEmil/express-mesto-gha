const express = require("express");
const mongoose = require("mongoose");
const NotFoundError = require("./error/Not-found-error");
const userRouter = require("./routes/users");
const cardRouter = require("./routes/cards");
const { createNewUser, login } = require("./controllers/users");
const auth = require("./middlewares/auth");
const { celebrate, Joi } = require("celebrate");
const { URL } = require("./utils/utils");
const helmet = require("helmet");
const { errors } = require("celebrate");

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/mestodb", {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(helmet());
app.use(errors());

app.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8).max(30),
    }),
  }),
  login
);

app.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(URL),
    }),
  }),
  createNewUser
);

app.use(auth);
app.use("/", cardRouter);
app.use("/", userRouter);
app.use("*", (req, res) => {
  res.status(NotFoundError).send({ message: "Страница не найдена" });
});

app.listen(PORT, () => console.log("Локальный сервер запущен"));
