import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as SocketIO from 'socket.io';

import { connectionOptions } from './constants';
import { LobbyHandler } from './lobby-handler.class';

const playgroundFile: Buffer = readFileSync(join(__dirname, 'playground.html'));

/** We need to add a basic HTTP server so HEROKU doesn't freak out when serving the base page. */
const httpServer = createServer((req, res) => {
  res.statusCode = req.url === '/' ? 200 : 404;
  res.end(playgroundFile, 'utf-8');
});
const socketServer = SocketIO(httpServer, connectionOptions);

/** Init server logic for handling connections. */
new LobbyHandler(socketServer);

/** Start listening and accepting connections. */
httpServer.listen(Number.parseInt(process.env['PORT'] as string) || 3000);
