import * as SocketIO from 'socket.io';

import { connectionOptions } from './constants';
import { LobbyHandler } from './lobby-handler.class';

const server = SocketIO(connectionOptions);
const lobbyHandler = new LobbyHandler(server);

/** Start listening and accepting connections. */
server.listen(Number.parseInt(process.env['PORT'] as string) || 3000);
