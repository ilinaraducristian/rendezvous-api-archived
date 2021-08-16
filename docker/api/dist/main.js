'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const platform_fastify_1 = require('@nestjs/platform-fastify');
const app_module_1 = require('./app.module');
const socket_io_adapter_1 = require('./socket-io.adapter');
bootstrap();

async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
  app.enableCors();
  app.useWebSocketAdapter(new socket_io_adapter_1.SocketIoAdapter(app, true));
  await app.listen(process.env.PORT || 3100, '0.0.0.0');
}

//# sourceMappingURL=main.js.map