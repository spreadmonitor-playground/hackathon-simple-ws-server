/**
 * A game room is a representation of a "game server" where users can join and
 * all messages will be automatically broadcasted to every participant.
 *
 * Note: A game room is logical entity but also has a Socket.IO room counterpart.
 */
export interface GameRoom {
  /**
   * Unique ID of the game room.
   * This ID will be used to generate a room in Socket.IO at /rooms/<ID>.
   */
  id: string;

  /** Type of the game, defined by the client. */
  type: string;

  /**
   * Display name for the game room. This can be user generated or generated by
   * the game itself automatically.
   */
  name: string;

  /**
   * Indicates whether the current game is running or not.
   * When a game is running no more users can join in.
   */
  currentlyRunning: boolean;

  /** Maximum allowed players. */
  maxAllowedParticipants: number;

  /** Currently joined players. */
  currentParticipants: number;

  /**
   * ID of all participants currently in the room.
   */
  participants: string[];
}
