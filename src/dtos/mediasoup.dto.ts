import { DtlsParameters, IceCandidate, IceParameters } from 'mediasoup/lib/WebRtcTransport';
import { SctpParameters } from 'mediasoup/lib/SctpParameters';
import { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/src/RtpParameters';

export type CreateTransportRequest = {
  type: string
}

export type TransportParameters = {
  id: string,
  iceParameters: IceParameters,
  iceCandidates: IceCandidate[],
  dtlsParameters: DtlsParameters,
  sctpParameters: SctpParameters,
}

export type CreateTransportResponse = {
  sendTransportParameters: TransportParameters,
  recvTransportParameters: TransportParameters
}

export type ConnectTransportRequest = {
  type: string,
  dtlsParameters: DtlsParameters,
}

export type CreateProducerRequest = {
  id: string,
  kind: MediaKind,
  rtpParameters: RtpParameters,
  appData: any
}

export type CreateConsumerRequest = {
  consumers: {
    socketId: string,
    rtpCapabilities: RtpCapabilities
  }[]
}

export type CreateConsumersResponse = {
  consumersParameters: { id: string, producerId: string, rtpParameters: RtpParameters, kind: MediaKind, appData: any }[]
}

export type ResumeConsumerRequest = {
  id: string
}