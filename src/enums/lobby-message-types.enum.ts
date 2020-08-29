/**
 * List of available commands regarding lobby operations.
 */
export enum LobbyMessageTypes {
  /** Broadcast event when any changes happens to the lobby. */
  LobbyStateChanged = 'lobby::state-changed',

  /** Instructs the server to create a room and put the current user into it. */
  CreateRoom = 'lobby::create-room',

  /** Removes the current user from the given room. */
  LeaveRoom = 'lobby::leave-room',

  /** Removes the current user from the given room. */
  JoinRoom = 'lobby::join-room',

  /**
   * Starts the game. This means
   *  - every user will start to receive broadcast messages
   *  - no new users can join the room.
   */
  StartGame = 'lobby::start-game',

  /**
   * Destroys the game room and remove everyone from the match.
   */
  DestroyGame = 'lobby::destroy-game',
}
