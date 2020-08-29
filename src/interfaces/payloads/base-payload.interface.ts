import { LobbyMessageTypes } from '../../enums';

export interface BasePayloadInterface<T = undefined> {
  /** Type of the current payload. */
  type: LobbyMessageTypes;

  /** The actual data we send in the response. */
  payload: T;
}
