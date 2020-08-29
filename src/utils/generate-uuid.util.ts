import { randomBytes } from 'crypto';

export function generateUUID(): string {
  return randomBytes(4).toString('hex');
}
