import { BetterAuthError } from 'better-auth'

/**
 * Creates and throws BetterAuthError prefixed with the adapter's name
 *
 * @param message - An error message for `BetterAuthError` instance
 */
export function createAdapterError(message: string): never {
  throw new BetterAuthError(`[Mikro ORM Adapter] ${message}`)
}
