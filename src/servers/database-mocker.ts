import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import idGenerator from "../id-generator";

const moduleMocker = new ModuleMocker(global);

const servers = new Map<number, any>();
const serverIdGenerator = idGenerator();

function databaseMocker(mockFactory: any) {
  if (mockFactory === "ServerRepository") {
    return {
      save: jest.fn(({ name, order }) => {
        const newServer = {
          id: serverIdGenerator.next().value,
          name,
          order
        };
        servers.set(newServer.id, newServer);
        return newServer;
      })
    };
  }
  if (typeof mockFactory === "function") {
    const mockMetadata = moduleMocker.getMetadata(mockFactory) as MockFunctionMetadata<any, any>;
    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
    return new Mock();
  }
}

export default databaseMocker;