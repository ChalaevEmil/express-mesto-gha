const express = require("express");
const mongoose = require("mongoose");
const { NOT_FOUND } = require("./utils/errors");
const { PORT = 3000 } = process.env;
const bodyParser = require("body-parser");

const userRouter = require("./routes/users");
const cardRouter = require("./routes/cards");

const app = express();

app.use((req, res, next) => {
  req.user = {
    _id: "64b57160cae638cd80dff30a",
  };
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(userRouter);
app.use(cardRouter);

app.use("*", (req, res) => {
  res.status(NOT_FOUND).send({ message: "Страница не найдена" });
});
mongoose.connect("mongodb://127.0.0.1:27017/mestodb");

app.listen(PORT, () => console.log("Локальный сервер запущен"));
