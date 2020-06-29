import io from 'socket.io-client';
const DefaultSocketUrl = process.env.VUE_APP_CI_SERVER_HOST;

export const initSocket = (host = ''): SocketIOClient.Socket => {
  if (!host) {
    //default socket
    return io(`${DefaultSocketUrl}/`);
  }
  //cinode dispatched socket
  return io(`${host}/socket`);
};
