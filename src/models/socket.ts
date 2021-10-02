import { Socket as SocketIOSocket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket';
import { Consumer } from 'mediasoup/lib/Consumer';
import { Producer } from 'mediasoup/lib/Producer';
import { WebRtcTransport } from 'mediasoup/lib/WebRtcTransport';

type Socket = Omit<SocketIOSocket, 'data'> & {
  data: {
    consumers: Consumer[],
    producer?: Producer,
    sendTransport?: WebRtcTransport,
    recvTransport?: WebRtcTransport
  },
  handshake: Omit<Handshake, 'auth'> & {
    auth: {
      sub: string,
    }
  }
}

export default Socket;