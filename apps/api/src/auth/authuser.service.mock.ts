import { ADMIN_USER_ID } from '@src/db/seeds/UserSeeder'

export const AUTH_USER_SERVICE_MOCK = {
  admin: () => true,
  sameUserOrAdmin: () => true,
  userID: () => ADMIN_USER_ID,
}
