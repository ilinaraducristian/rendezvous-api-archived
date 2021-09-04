import { DtlsParameters, IceCandidate, IceParameters } from 'mediasoup/lib/WebRtcTransport';
import { SctpParameters } from 'mediasoup/lib/SctpParameters';

type CreateTransportRequest = {
  type: string
}

type CreateTransportResponse = {
  transportParameters: {
    id: string,
    iceParameters: IceParameters,
    iceCandidates: IceCandidate[],
    dtlsParameters: DtlsParameters,
    sctpParameters: SctpParameters,
  },
}

type ConnectTransportRequest = {
  type: string,
  id: string
  dtlsParameters: DtlsParameters,
}

type CreateProducerRequest = {}

type CreateConsumerRequest = {
  transportId: string,
  socketId: string
}

type ResumeConsumerRequest = {
  id: string
}


export {
  CreateTransportRequest,
  CreateTransportResponse,
  ConnectTransportRequest,
  CreateProducerRequest,
  CreateConsumerRequest,
  ResumeConsumerRequest,
};