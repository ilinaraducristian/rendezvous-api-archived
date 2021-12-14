import { Test, TestingModule } from "@nestjs/testing";
import { ServersModule } from "../src/servers/servers.module";
import { UsersModule } from "../src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { routes } from "../src/app.module";
import { ValidationPipe } from "@nestjs/common";
import MongooseModules from "../src/MongooseModules";
import { AuthGuard, KeycloakConnectModule } from "nest-keycloak-connect";
import { APP_GUARD } from "@nestjs/core";

describe("Auth Test (e2e)", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ServersModule,
        UsersModule,
        MongooseModules,
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
        routes,
        KeycloakConnectModule.register({
          authServerUrl: "http://127.0.0.1:8080/auth",
          realm: "rendezvous",
          clientId: "rendezvous-api",
          secret: "c1b9732c-d644-4339-8b7b-ff58214cded2"
        })
      ],
      controllers: [],
      providers: [
        {
          provide: APP_GUARD,
          useClass: AuthGuard
        }
      ]
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => module.close());


  it("should create a new server", async () => {
    const serverResponse = await app.inject({
      method: "POST",
      url: "/servers",
      headers: { Authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOY1RacjI3RnNhWVpSc0VacDRHR19nTnFpaGs4NFFKN25DVHVfWURrN3VnIn0.eyJleHAiOjE2Mzg1OTYyNzgsImlhdCI6MTYzODU5NTk3OCwiYXV0aF90aW1lIjoxNjM4NTk1NDg2LCJqdGkiOiI2OWVmZGMxZC1jYWZiLTQ5Y2EtYWIyMC03MzU2NDhiZDRlNjAiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvcmVuZGV6dm91cyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjNTNkMjlkNC0yMzc1LTQ0NWQtOTFmYy0xN2I1ZmM3ODIxNmMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJyZW5kZXp2b3VzLWZyb250ZW5kIiwic2Vzc2lvbl9zdGF0ZSI6Ijg0MGUwZWZiLWFmZjktNGJhNi1hNzFmLTk5NzQ3ZjZmN2VjYSIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1yZW5kZXp2b3VzIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6Ijg0MGUwZWZiLWFmZjktNGJhNi1hNzFmLTk5NzQ3ZjZmN2VjYSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlVzZXIxIE5hbWUxIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlcjEiLCJnaXZlbl9uYW1lIjoiVXNlcjEiLCJmYW1pbHlfbmFtZSI6Ik5hbWUxIiwiZW1haWwiOiJ1c2VyMUBlbWFpbC5jb20ifQ.mloDMbPCF4YpHU4NVh5WPMsSZS-YmorAUcYm_kYvi2OQfDaulN0CFdRUFIEUvyaeDt2qHfbAehRkqVZ9lXpqaUJoc-vlIMsAfz8j51aL7wIF42gDcqrc7t1EFBZqLtklYZ5G9JqbA7dT83U9R9fJ6RhKohbdYLGQVxisaQvcS2xXuC4xam-ygEeoV_jqhEDMu1ITQkYoZH5Sgd33z19A_6i7n45WN0k8jHCaBCZVhfTuxcUcwR335_kGS-dA7qbbk2uV_eVbmNfy1IQnUIsE3usdI8HgVYXhPfnQItgtyedDeSkq-i05VgNtk4klUejD3nnM0_jodeZ4OrtLGwhBWA" },
      payload: { name: "a new server" }
    });
    expect(serverResponse.statusCode).toEqual(201);
    const server = serverResponse.json();
  });

});
