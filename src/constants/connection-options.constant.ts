import { ServerOptions } from 'socket.io';

/**
 * Connection options for the Socket.IO server.
 * Full list of options can be found at: https://socket.io/docs/server-api/.
 */
export const connectionOptions: ServerOptions = {
  /**
   * Where to connect on the server.
   * Example: `myhost.com:3000/socket`
   */
  // TODO: currently this breaks the transport.
  // path: 'socket',

  /**
   * Disable per message deflate as it adds significant overhead in terms of
   * performance and memory consumption.
   */
  perMessageDeflate: false,

  /**
   * Disable serving the client files to prevent someone using this hosting
   * for static assets.
   */
  serveClient: false,

  /**
   * Heroku has a 30 second timeout rule so we need to ping clients every 30
   * sec to prevent H12 errors on Heroku.
   *
   * Ref: https://devcenter.heroku.com/articles/http-routing#timeouts
   */
  pingInterval: 20_000,
  pingTimeout: 5_000,

  /**
   * Disable polling as we don't need support for that.
   */
  transports: ['websocket'],

  /** Disabling cookies as we don't need it. */
  cookie: false,
};
