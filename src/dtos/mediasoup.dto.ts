import { DtlsParameters, IceCandidate, IceParameters } from 'mediasoup/lib/WebRtcTransport';
import { SctpParameters } from 'mediasoup/lib/SctpParameters';
import { MediaKind, RtpParameters } from 'mediasoup/src/RtpParameters';

export type CreateTransportRequest = {
  type: string
}

export type CreateTransportResponse = {
  transportParameters: {
    id: string,
    iceParameters: IceParameters,
    iceCandidates: IceCandidate[],
    dtlsParameters: DtlsParameters,
    sctpParameters: SctpParameters,
  },
}

export type ConnectTransportRequest = {
  type: string,
  id: string
  dtlsParameters: DtlsParameters,
}

export type CreateProducerRequest = {
  id: string,
  kind: MediaKind,
  rtpParameters: RtpParameters,
  appData: any
}

export type CreateConsumerRequest = {
  transportId: string,
  socketId: string
}

export type ResumeConsumerRequest = {
  id: string
}