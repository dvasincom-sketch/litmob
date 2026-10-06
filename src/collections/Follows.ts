import type { CollectionConfig } from 'payload'
import { loggedIn, ownOrStaff } from '../access'

/**
 * «Сообщим о проде» — главный лидмагнит (каждый пятый комментарий у книг —
 * «когда прода»). Подписка на книгу или на литмоб целиком.
 * Уникальность пары (user, target) держит индекс в миграции.
 */
export const Follows: CollectionConfig = {
  slug: 'follows',
  labels: { singular: 'Подписка на проду', plural: 'Подписки на проду' },
  admin: { useAsTitle: 'id', defaultColumns: ['user', 'book', 'litmob', 'createdAt'], group: 'Читатели' },
  access: { read: ownOrStaff, create: loggedIn, update: ownOrStaff, delete: ownOrStaff },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !(req.user as any).roles?.includes('admin')) data.user = (req.user as any).id
        return data
      },
    ],
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true, label: 'Читатель' },
    { name: 'book', type: 'relationship', relationTo: 'books', index: true, label: 'Книга' },
    { name: 'litmob', type: 'relationship', relationTo: 'litmobs', index: true, label: 'Литмоб' },
    {
      name: 'channel',
      type: 'select',
      label: 'Куда сообщать',
      defaultValue: 'email',
      options: [
        { label: 'Почта', value: 'email' },
        { label: 'Push', value: 'push' },
      ],
    },
  ],
  timestamps: true,
}
