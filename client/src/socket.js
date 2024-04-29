const { io } = require("socket.io-client");

const socket = new io("http://localhost:4000", {
  autoConnect: false,
  withCredentials: true,
});

module.exports = socket;
