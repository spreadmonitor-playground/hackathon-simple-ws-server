/**
 * Emits a general error message to the given socket.
 * @param socket a socket instance
 * @param message the error message to send
 */
export function emitErrorMessage(socket: SocketIO.Socket, message: string): void {
  socket.emit('error::general', { message });
}
