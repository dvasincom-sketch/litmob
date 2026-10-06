/**
 * Создать администратора или сбросить ему пароль (и снять блокировку после неудачных входов).
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='новый-пароль' npm run admin
 */
import 'dotenv/config'
import config from '../payload.config'
import { getPayload } from 'payload'

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.SEED_ADMIN_PASSWORD
if (!email || !password) {
  console.error('Укажите SEED_ADMIN_EMAIL и SEED_ADMIN_PASSWORD.')
  process.exit(1)
}

const payload = await getPayload({ config })
const o = { overrideAccess: true } as const
const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, ...o })
const user = found.docs[0] as { id: number; roles?: string[] } | undefined

if (user) {
  const roles = Array.from(new Set([...(user.roles || []), 'admin']))
  await payload.update({ collection: 'users', id: user.id, data: { password, roles, loginAttempts: 0, lockUntil: null } as never, ...o })
  console.log(`Пароль обновлён, роль admin выдана, блокировка снята: ${email}`)
} else {
  await payload.create({ collection: 'users', data: { email, password, name: 'Администратор', roles: ['admin'] } as never, ...o })
  console.log(`Администратор создан: ${email}`)
}
const all = await payload.find({ collection: 'users', where: { roles: { contains: 'admin' } }, limit: 20, depth: 0, ...o })
console.log('Администраторы:', all.docs.map((u) => (u as { email: string }).email).join(', '))
process.exit(0)
