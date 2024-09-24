const express = require("express");
const { Server } = require("socket.io");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const smartReplyRouter = require('./routers/smartReplyRouter');
const authRouter = require("./routers/authRouter");
const {
  authorizeUser,
  addFriend,
  initializeUser,
  onDisconnect,
  dm,
} = require("./controllers/socketController");
const { corsConfig } = require("./controllers/serverController");
const server = require("http").createServer(app);
require("dotenv").config();

const io = new Server(server, {
  cors: corsConfig,
});

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());
app.use("/auth", authRouter);
app.use('/smart-reply', smartReplyRouter);

io.use(authorizeUser);
io.on("connect", (socket) => {
  initializeUser(socket);

  socket.on("add_friend", (friendName, cb) => {
    addFriend(socket, friendName, cb);
  });

  socket.on("dm", (message) => dm(socket, message));

  socket.on("disconnecting", () => onDisconnect(socket));
});

server.listen(4000, () => {
  console.log("Server listening on port 4000");
});
