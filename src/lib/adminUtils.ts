/** Admin email detection — normalized (trimmed, lowercase) */
export const ADMIN_EMAIL = 'odoboyemi@gmail.com'

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === ADMIN_EMAIL
}
