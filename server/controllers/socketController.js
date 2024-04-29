const redisClient = require("../redis");
const jwt = require('jsonwebtoken');
require("dotenv").config();

module.exports.authorizeUser = (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log(token);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Bad request!", err);
      next(new Error("Not authorized"));
    } else {
      socket.user = { ...decoded };
      next();
    }
  });
};

module.exports.initializeUser = async (socket) => {
  socket.join(socket.user.userid);
  await redisClient.hset(
    `userid:${socket.user.username}`,
    "userid",
    socket.user.userid,
    "connected",
    true
  );

  const friendList = await redisClient.lrange(
    `friends:${socket.user.username}`,
    0,
    -1
  );

  const parsedFriendList = await parseFriendList(friendList);
  const friendRooms = parsedFriendList.map((friend) => friend.userid);

  if (friendRooms.length > 0)
    socket.to(friendRooms).emit("connected", true, socket.user.username);

  socket.emit("friends", parsedFriendList); // sends event to socket frontend with the data of friendList array

  const msgQuery = await redisClient.lrange(
    `chat:${socket.user.userid}`,
    0,
    -1
  ); //fetch chats

  const messages = msgQuery.map((msgStr) => {
    const parsedStr = msgStr.split(".");
    return { to: parsedStr[0], from: parsedStr[1], content: parsedStr[2] };
  });

  if (messages && messages.length > 0) {
    socket.emit("messages", messages);
  }
};

module.exports.addFriend = async (socket, friendName, cb) => {
  if (friendName === socket.user.username) {
    cb({ done: false, errorMsg: "Cannot add yourself!" });
    return;
  }
  const friend = await redisClient.hgetall(`userid:${friendName}`);
  const currentFriendList = await redisClient.lrange(
    `friends:${socket.user.username}`,
    0,
    -1
  );
  if (!friend.userid) {
    cb({ done: false, errorMsg: "User doesn't exist!" });
    return;
  }
  if (
    currentFriendList &&
    currentFriendList.indexOf(`${friendName}.${friend.userid}`) !== -1
  ) {
    cb({ done: false, errorMsg: "Friend already added!" });
    return;
  }

  await redisClient.lpush(
    `friends:${socket.user.username}`,
    [friendName, friend.userid].join(".")
  );

  const newFriend = {
    username: friendName,
    userid: friend.userid,
    connected: friend.connected,
  };
  cb({ done: true, newFriend });
};

module.exports.onDisconnect = async (socket) => {
  await redisClient.hset(`userid:${socket.user.username}`, "connected", false);
  const friendList = await redisClient.lrange(
    `friends:${socket.user.username}`,
    0,
    -1
  );
  const friendRooms = await parseFriendList(friendList).then((friends) =>
    friends.map((friend) => friend.userid)
  );
  socket.to(friendRooms).emit("connected", false, socket.user.username); //emit to all friends that are offline
};

const parseFriendList = async (friendList) => {
  const newFriendList = [];
  for (let friend of friendList) {
    const parsedFriend = friend.split(".");
    const friendConnnected = await redisClient.hget(
      `userid:${parsedFriend[0]}`,
      "connected"
    );
    newFriendList.push({
      username: parsedFriend[0],
      userid: parsedFriend[1],
      connected: friendConnnected,
    });
  }
  return newFriendList;
};

module.exports.dm = async (socket, message) => {
  message.from = socket.user.userid;
  const messageString = [message.to, message.from, message.content].join(".");

  await redisClient.lpush(`chat:${message.to}`, messageString);
  await redisClient.lpush(`chat:${message.from}`, messageString);

  socket.to(message.to).emit("dm", message);
};
