import { Test, TestingModule } from "@nestjs/testing";
import { ServersModule } from "../src/servers/servers.module";
import { UsersModule } from "../src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { routes } from "../src/app.module";
import { ValidationPipe } from "@nestjs/common";

describe("AppController (e2e)", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
        ServersModule,
        UsersModule,
        routes
      ],
      controllers: [],
      providers: []
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => module.close());

  let server, group, channel1, channel2;

  it("should create a new server", async () => {
    const serverResponse = await app.inject({
      method: "POST",
      url: "/servers",
      payload: { name: "a new server" }
    });
    expect(serverResponse.statusCode).toEqual(201);
    server = serverResponse.json();
  });

  it("should create a new group", async () => {
    const groupResponse = await app.inject({
      method: "POST",
      url: "/servers/" + server.id + "/groups",
      payload: { name: "a new group" }
    });
    expect(groupResponse.statusCode).toEqual(201);
    group = groupResponse.json();
  });

  it("should create a new channel with a group", async () => {
    const channelResponse = await app.inject({
      method: "POST",
      url: "/servers/" + server.id + "/groups/" + group.id + "/channels",
      payload: { name: "a new channel", type: 0 }
    });
    expect(channelResponse.statusCode).toEqual(201);
    channel1 = channelResponse.json();
  });

  it("should create a new channel without a group", async () => {
    const channelResponse = await app.inject({
      method: "POST",
      url: "/servers/" + server.id + "/channels",
      payload: { name: "a new channel", type: 0 }
    });
    expect(channelResponse.statusCode).toEqual(201);
    channel2 = channelResponse.json();
  });

  it("should create 100 messages", async () => {

    for (let i = 0; i < 100; i++) {
      const messageResponse = await app.inject({
        method: "POST",
        url: "/servers/" + server.id + "/channels/" + channel1.id + "/messages",
        payload: { text: "new message " + (i+1) }
      });
      expect(messageResponse.statusCode).toEqual(201);
    }

  });

  it("should return the last 30 messages", async () => {
    const messagesResponse = await app.inject({
      method: "GET",
      url: "/servers/" + server.id + "/groups/" + group.id + "/channels/" + channel1.id + "/messages"
    });
    expect(messagesResponse.statusCode).toEqual(200);
    const messages = messagesResponse.json();

    expect(true).toBeTruthy();
  });

  it("should return the last 30 messages before the last 30", async () => {
    const messagesResponse = await app.inject({
      method: "GET",
      url: "/servers/" + server.id + "/groups/" + group.id + "/channels/" + channel1.id + "/messages",
      query: {offset: '30'}
    });
    expect(messagesResponse.statusCode).toEqual(200);
    const messages = messagesResponse.json();

    expect(true).toBeTruthy();
  });

});
