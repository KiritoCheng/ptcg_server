const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");

const app = express();
const port = 4000;

// 载入中间件
// 压缩响应头，提升性能
app.use(compression());
//node.js 中间件，用于处理 JSON, Raw, Text 和 URL 编码的数据。
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//这就是一个解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
app.use(cookieParser());
// 加载静态资源
app.use("./static", express.static(path.join(__dirname, "./static/")));

// 设置头信息
app.use(cors());
// app.all("*", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By", " 3.2.1");
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });

// api部分
const category = require("./api/category/category.js");
const card = require("./api/card/card.js");
category(app);
card(app);

// https 配置
const httpsOption = {
  key: fs.readFileSync("/path/ssl/kiritosa.com/key.pem"),
  cert: fs.readFileSync("/path/ssl/kiritosa.com/fullchain.pem"),
};

// var options = {
//   key: fs.readFileSync('/path/to/privkey.pem'),
//   cert: fs.readFileSync('/path/to/fullchain.pem'),
//   ca: fs.readFileSync('/path/to/chain.pem')
// }

http.createServer(app).listen(80);
https.createServer(httpsOption, app).listen(443);

// app.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });
