import * as SocketIO from 'socket.io';

import { GameRoomMessageTypes, LobbyMessageTypes } from './enums';
import { GameRoom } from './interfaces';
import { IdentifierPayload } from './interfaces/payloads';
import { BasePayloadInterface } from './interfaces/payloads/base-payload.interface';
import { emitErrorMessage, generateUUID } from './utils';
/**
 * This class is responsible for creating and updating rooms and notifying the
 * consumers about the changes to any rooms in the lobby.
 */
export class LobbyHandler {
  private gameRooms: { [id: string]: GameRoom } = {};

  constructor(private server: SocketIO.Server) {
    /**
     * Users automatically join the lobby room where available rooms are
     * broadcasted for everyone.
     */
    server.on('connection', socket => {
      console.log(`Someone connected to the server as Socket#${socket.id}`);

      /** Join the global lobby where games are listed. */
      socket.join('lobby');
      /** Emit the current state of lobby to the connected user. */
      this.emitLobbyStateChange(socket);

      /** Setup event handlers for this user (socket) */
      this.joinRoomHandler(socket);
      this.leaveRoomHandler(socket);
      this.createRoomHandler(socket);
      this.startGameHandler(socket);
      this.destroyGameHandler(socket);

      this.emitToCurrentRoom(socket);

      /**
       * When someone leaves we need to remove him/her from all rooms and
       * remove all listeners related to that socket.
       */
      socket.on('disconnect', () => {
        console.log(`Someone left the server as Socket#${socket.id}. Cleaning up resources.`);

        this.removeFromAllRooms(socket);

        /** Emit the new lobby state to all users. */
        this.emitLobbyStateChange(this.server);

        socket.removeAllListeners();
      });
    });
  }

  private leaveRoomHandler(socket: SocketIO.Socket): void {
    socket.on(LobbyMessageTypes.LeaveRoom, () => {
      /** Remove the user from all rooms, this is valid because one user can be joined to one room only. */
      this.removeFromAllRooms(socket);

      /** Emit the new lobby state to all users. */
      this.emitLobbyStateChange(this.server);
    });
  }

  private joinRoomHandler(socket: SocketIO.Socket): void {
    socket.on(LobbyMessageTypes.JoinRoom, (payload: IdentifierPayload) => {
      // TODO: add proper scalable payload verification
      if (typeof payload.id !== 'string') {
        emitErrorMessage(socket, 'The sent payload is invalid.');

        return;
      }

      if (this.gameRooms[payload.id] === undefined) {
        emitErrorMessage(socket, `Cannot join room: room doesn't exists.`);

        return;
      }

      if (this.gameRooms[payload.id].currentlyRunning) {
        emitErrorMessage(socket, 'Cannot join room: game has already started.');

        return;
      }

      if (this.gameRooms[payload.id].maxAllowedParticipants <= this.gameRooms[payload.id].currentParticipants + 1) {
        emitErrorMessage(socket, 'Cannot join room: room is full.');

        return;
      }

      this.removeFromAllRooms(socket);

      /** Add the user to the rooms */
      this.gameRooms[payload.id].participants.push(socket.id);

      /** Join the current user in (socket). */
      socket.join(this.gameRooms[payload.id].id);

      /** Emit the new lobby state to all users. */
      this.emitLobbyStateChange(this.server);
    });
  }

  /**
   * Creates a new room and adds the current user to it.
   * (Removing him/her from any other rooms.)
   * @param socket
   */
  private createRoomHandler(socket: SocketIO.Socket): void {
    socket.on(LobbyMessageTypes.CreateRoom, (payload: Pick<GameRoom, 'type' | 'name' | 'maxAllowedParticipants'>) => {
      const roomId = `game-room/${generateUUID()}`;

      // TODO: add proper scalable payload verification
      if (
        typeof payload.type !== 'string' ||
        typeof payload.name !== 'string' ||
        typeof payload.maxAllowedParticipants !== 'number'
      ) {
        emitErrorMessage(socket, 'The sent payload is invalid.');

        return;
      }

      /** One user allowed in one room only. */
      this.removeFromAllRooms(socket);

      /** Create the room on the server. */
      this.gameRooms[roomId] = {
        id: roomId,
        type: payload.type,
        name: payload.name,
        currentlyRunning: false,
        currentParticipants: 1,
        participants: [socket.id],
        maxAllowedParticipants: payload.maxAllowedParticipants,
      };

      /** Join the current user in (socket). */
      socket.join(roomId);

      /** Emit the new lobby state to all users. */
      this.emitLobbyStateChange(this.server);
    });
  }

  private startGameHandler(socket: SocketIO.Socket): void {
    socket.on(LobbyMessageTypes.StartGame, () => {
      const roomId = this.findEnteredRoom(socket);

      if (!roomId) {
        emitErrorMessage(socket, `Cannot start game, because user is not part of any room!`);

        return;
      }

      this.gameRooms[roomId].currentlyRunning = true;

      /** Emit the new lobby state to all users. */
      this.emitLobbyStateChange(this.server);
    });
  }

  private destroyGameHandler(socket: SocketIO.Socket): void {
    socket.on(LobbyMessageTypes.DestroyGame, () => {
      emitErrorMessage(socket, `The ${LobbyMessageTypes.DestroyGame} command is not supported currently`);
    });
  }

  /**
   * Emits the received message to all members in the same room as the socket.
   * @param socket the socket of the user
   */
  private emitToCurrentRoom(socket: SocketIO.Socket): void {
    socket.on(GameRoomMessageTypes.CurrentRoom, (payload: unknown) => {
      const roomId = this.findEnteredRoom(socket);

      if (roomId) {
        socket.to(roomId).emit('broadcast', payload);
      }
    });
  }

  /**
   * Returns the ID of the entered room for the user or undefined.
   * @param socket the socket of the user
   */
  private findEnteredRoom(socket: SocketIO.Socket): string | undefined {
    const resultList = Object.values(this.gameRooms)
      .filter(room => room.participants.includes(socket.id))
      .map(room => room.id);

    if (resultList.length === 1) {
      return resultList[0];
    }

    return undefined;
  }

  /**
   * Removes the current user from all rooms he/she belongs to.
   * @param socket the socket of the user
   */
  private removeFromAllRooms(socket: SocketIO.Socket) {
    Object.values(this.gameRooms).forEach(gameRoom => {
      gameRoom.participants = gameRoom.participants.filter(id => id !== socket.id);
      socket.leave(gameRoom.id);
    });

    this.cleanupEmptyRooms();
  }

  /**
   * Removes all empty rooms from the server.
   */
  private cleanupEmptyRooms() {
    Object.values(this.gameRooms)
      .filter(room => room.participants.length === 0)
      .forEach(room => delete this.gameRooms[room.id]);
  }

  private emitLobbyStateChange(target: SocketIO.Server | SocketIO.Socket) {
    target.emit(LobbyMessageTypes.LobbyStateChanged, <BasePayloadInterface<{ [id: string]: GameRoom }>>{
      type: LobbyMessageTypes.LobbyStateChanged,
      payload: this.gameRooms,
    });
  }
}
