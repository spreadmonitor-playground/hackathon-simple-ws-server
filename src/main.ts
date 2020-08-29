import { createServer } from 'http';
import * as SocketIO from 'socket.io';

import { connectionOptions } from './constants';
import { LobbyHandler } from './lobby-handler.class';

/** We need to add a basic HTTP server so HEROKU doesn't freak out when serving the base page. */
const httpServer = createServer((req, res) => {
  console.log(req.url === '/');
  res.statusCode = req.url === '/' ? 200 : 404;
  res.end('Nothing to see here.');
});
const socketServer = SocketIO(httpServer, connectionOptions);

/** Init server logic for handling connections. */
new LobbyHandler(socketServer);

/** Start listening and accepting connections. */
httpServer.listen(Number.parseInt(process.env['PORT'] as string) || 3000);
