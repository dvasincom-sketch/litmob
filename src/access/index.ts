import type { Access, FieldAccess, Where } from 'payload'

/**
 * Роли пользователей Литмоба. Один сайт без тенантов: авторы, чтецы и читатели —
 * это роли в одной коллекции `users`. В админку Payload пускаем только
 * admin и editor; авторы и чтецы работают через свои кабинеты на сайте.
 */
export type Role = 'admin' | 'editor' | 'author' | 'narrator' | 'reader'

type MaybeUser = { id?: number | string; roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.roles?.some((r) => roles.includes(r)))

export const isStaff = (user: MaybeUser) => hasRole(user, 'admin', 'editor')

/** Только админ и редактор. */
export const staffOnly: Access = ({ req }) => isStaff(req.user as MaybeUser)

/** Только админ. */
export const adminOnly: Access = ({ req }) => hasRole(req.user as MaybeUser, 'admin')

export const adminOnlyField: FieldAccess = ({ req }) => hasRole(req.user as MaybeUser, 'admin')

/** Любой может читать. */
export const anyone: Access = () => true

/**
 * Публичное чтение только опубликованного; персонал видит всё.
 * Коллекция должна иметь чекбокс `published`.
 */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff(req.user as MaybeUser)) return true
  const where: Where = { published: { equals: true } }
  return where
}

/** Свои записи (поле `user`) или персонал. */
export const ownOrStaff: Access = ({ req }) => {
  const user = req.user as MaybeUser
  if (!user) return false
  if (isStaff(user)) return true
  return { user: { equals: user.id } }
}

/** Любой залогиненный. */
export const loggedIn: Access = ({ req }) => Boolean(req.user)
