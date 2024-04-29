import io from 'socket.io-client';

const socket = (user) =>
  new io("http://localhost:4000", {
    autoConnect: false,
    withCredentials: true,
    auth: {
      token: user.token,
    },
  });

export default socket;
