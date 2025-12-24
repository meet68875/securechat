import { clearAuthCookies } from "../../../../../database/cookies";

export async function POST() {
  return clearAuthCookies();
}