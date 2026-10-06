import type { CollectionConfig } from 'payload'
import { loggedIn, ownOrStaff } from '../access'

/**
 * Полка читателя: «хочу послушать», «слушаю», «прослушано» и место,
 * на котором остановился (глава + секунда). Одна запись на пару читатель–книга.
 */
export const Shelf: CollectionConfig = {
  slug: 'shelf',
  labels: { singular: 'Книга на полке', plural: 'Полка' },
  admin: { useAsTitle: 'id', defaultColumns: ['user', 'book', 'status', 'updatedAt'], group: 'Читатели' },
  access: { read: ownOrStaff, create: loggedIn, update: ownOrStaff, delete: ownOrStaff },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        const u = req.user as { id: number; roles?: string[] } | null
        if (operation === 'create' && u && !u.roles?.includes('admin')) data.user = u.id
        return data
      },
    ],
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true, label: 'Читатель' },
    { name: 'book', type: 'relationship', relationTo: 'books', required: true, index: true, label: 'Книга' },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'want',
      options: [
        { label: 'Хочу послушать', value: 'want' },
        { label: 'Слушаю', value: 'listening' },
        { label: 'Прослушано', value: 'done' },
      ],
    },
    { name: 'chapter', type: 'relationship', relationTo: 'chapters', label: 'Глава' },
    { name: 'positionSec', type: 'number', label: 'Место, сек', defaultValue: 0 },
  ],
  timestamps: true,
}
