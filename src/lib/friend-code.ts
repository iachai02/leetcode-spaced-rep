/**
 * Generate a random 8-character alphanumeric friend code
 * Uses uppercase letters and digits for easy sharing
 */
export function generateFriendCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
