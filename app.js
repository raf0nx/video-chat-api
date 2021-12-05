const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const dayjs = require("dayjs");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const auth = require("./routes/auth");
const users = require("./routes/users");
const chat = require("./chat_namespace");
const config = require("./config/index");
const utils = require("./utils/utils");
require("./config/passport.config");
require("dotenv").config();

const server = http.createServer(app);
const io = (app.io = require("socket.io")(server, {
  cors: {
    origin: config.ORIGIN,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
}));

app.use(
  cors({
    origin: config.ORIGIN,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);

app.use(morgan("combined", { stream: utils.accessLogStream }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests! Your access to application is restricted until ",
  handler: (req, res, _, options) => {
    res.status(options.statusCode).send({
      message: `${options.message}${dayjs(req.rateLimit.resetTime).format(
        "H:mm"
      )}.`,
    });
  },
});
app.use(limiter);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", auth);
app.use("/users", users);

app.use(express.static(path.join(__dirname, "../dist")));
chat.createNameSpace(io);

const pubClient = createClient({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

server.listen(config.PORT, () =>
  console.log(`Server is running on port ${config.PORT}`)
);
