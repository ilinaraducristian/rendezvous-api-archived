import { Test, TestingModule } from "@nestjs/testing";
import { ServersModule } from "../src/servers/servers.module";
import { UsersModule } from "../src/users/users.module";
import { RouterModule } from "@nestjs/core";
import { GroupsModule } from "../src/groups/groups.module";
import { ChannelsModule } from "../src/channels/channels.module";
import { MongooseModule } from "@nestjs/mongoose";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { MessagesModule } from "../src/messages/messages.module";

describe("ChannelsController (e2e)", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
        ServersModule,
        UsersModule,
        RouterModule.register([
          {
            path: 'servers',
            module: ServersModule,
            children: [
              {
                path: ":serverId/groups",
                module: GroupsModule,
                children: [
                  {
                    path: ":groupId/channels",
                    module: ChannelsModule,
                    children: [
                      {
                        path: ":channelId/messages",
                        module: MessagesModule
                      }
                    ]
                  }
                ]
              },
              {
                path: ":serverId/channels",
                module: ChannelsModule,
                children: [
                  {
                    path: ":channelId/messages",
                    module: MessagesModule
                  }
                ]
              }
            ]
          }
        ])
      ],
      controllers: [],
      providers: []
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => module.close());

  describe("create a new channel", () => {

    it("should create a new channel", async () => {
      const serverResponse = await app.inject({
        method: "POST",
        url: "/servers",
        payload: { name: "a new server" }
      });
      expect(serverResponse.statusCode).toEqual(201);
      const server = serverResponse.json();

      const groupResponse = await app.inject({
        method: "POST",
        url: "/servers/"+server.id+"/groups",
        payload: { name: "     a new group    " }
      });
      const group = groupResponse.json();
      expect(groupResponse.statusCode).toEqual(201);

      const channel1Response = await app.inject({
        method: "POST",
        url: "/servers/"+server.id+"/channels",
        payload: { name: "     a new channel    " }
      });
      const channel1 = channel1Response.json();
      expect(channel1Response.statusCode).toEqual(201);

      const channel2Response = await app.inject({
        method: "POST",
        url: "/servers/"+server.id+"/groups/"+group.id+"/channels",
        payload: { name: "     a new channel    " }
      });
      const channel2 = channel2Response.json();
      expect(channel2Response.statusCode).toEqual(201);

      expect(true).toBeTruthy();
    });

    it("should return 404 server not found", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/servers/fakeid/groups",
        payload: { name: "a new group" }
      });
      const body = response.json();
      expect(response.statusCode).toEqual(404);
      expect(body).toStrictEqual({
        statusCode: 404,
        message: `server with id 'fakeid' not found`
      })
    });

    it("should return 400 group name must not be empty", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/servers/fakeid/groups",
        payload: { name: "         " }
      });
      const body = response.json();
      expect(response.statusCode).toEqual(400);
      expect(body).toStrictEqual({
        statusCode: 400,
        message: "group name must not be empty"
      });

    });

  });

});
