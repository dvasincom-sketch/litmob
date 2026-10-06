import type { CollectionConfig } from 'payload'
import { adminOnlyField, isStaff } from '../access'

/**
 * Все пользователи: персонал, авторы, чтецы и читатели. В админку Payload
 * пускаем только admin/editor. Новый пользователь — читатель; роли автора
 * и чтеца выдаёт модератор (или онбординг кабинета во второй итерации).
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'name', 'roles', 'createdAt'], group: 'Люди' },
  access: {
    admin: ({ req }) => isStaff(req.user as any),
    read: ({ req }) => {
      const user = req.user as any
      if (isStaff(user)) return true
      if (!user) return false
      return { id: { equals: user.id } }
    },
    create: () => true,
    update: ({ req }) => {
      const user = req.user as any
      if (isStaff(user)) return true
      if (!user) return false
      return { id: { equals: user.id } }
    },
    delete: ({ req }) => isStaff(req.user as any),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Имя' },
    {
      name: 'roles',
      type: 'select',
      label: 'Роли',
      hasMany: true,
      defaultValue: ['reader'],
      saveToJWT: true,
      access: { create: adminOnlyField, update: adminOnlyField },
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
        { label: 'Автор', value: 'author' },
        { label: 'Чтец', value: 'narrator' },
        { label: 'Читатель', value: 'reader' },
      ],
    },
    { name: 'adultConfirmedAt', type: 'date', label: 'Подтвердил 18+' },
  ],
  timestamps: true,
}
