const express = require("./express");

const app = express();

app.use("/", function (req, res, next) {
  res.setHeader("Content-Type", "text/html;charset=utf-8");
  next();
});

app.use("/name", function (req, res, next) {
  next("名字不合法");
});

app.get("/name", function (req, res) {
  res.end("张三");
});

app.post("/age", function (req, res) {
  res.end("14");
});

app.all("/sex", function (req, res) {
  res.end("男");
});

app.use(function (err, req, res, next) {
  next(err);
});

app.use(function (err, req, res, next) {
  res.end(err);
});
app.listen(3000, function () {
  console.log("server listen on 3000");
});
