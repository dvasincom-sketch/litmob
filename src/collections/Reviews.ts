import type { Access, CollectionConfig, Where } from 'payload'
import { isStaff, loggedIn } from '../access'

/** Читают все одобренные отзывы; автор отзыва видит свои; персонал — всё. */
const readReviews: Access = ({ req }) => {
  const u = req.user as { id: number; roles?: string[] } | null
  if (u && isStaff(u as never)) return true
  const approved: Where = { status: { equals: 'approved' } }
  return u ? { or: [approved, { user: { equals: u.id } }] } : approved
}

/**
 * Отзывы читателей о книгах. Один отзыв на пару читатель–книга, публикуются после модерации.
 * На странице книги дают блок «Отзывы о книге» и рейтинг в разметке Schema.org.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Отзыв', plural: 'Отзывы' },
  admin: { useAsTitle: 'id', defaultColumns: ['book', 'user', 'rating', 'status', 'createdAt'], group: 'Читатели' },
  access: { read: readReviews, create: loggedIn, update: ({ req }) => isStaff(req.user as never), delete: ({ req }) => isStaff(req.user as never) },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        const u = req.user as { id: number; roles?: string[] } | null
        if (operation === 'create' && u && !isStaff(u as never)) {
          data.user = u.id
          data.status = 'pending'
          data.authorName = ((u as { name?: string }).name || '').trim().slice(0, 60) || 'Читатель'
        }
        if (typeof data.text === 'string') data.text = data.text.trim()
        return data
      },
    ],
  },
  fields: [
    { name: 'book', type: 'relationship', relationTo: 'books', required: true, index: true, label: 'Книга' },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true, label: 'Читатель' },
    { name: 'authorName', type: 'text', label: 'Имя на сайте', admin: { description: 'Показывается под отзывом.' } },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5, label: 'Оценка (1–5)' },
    { name: 'text', type: 'textarea', required: true, minLength: 20, maxLength: 3000, label: 'Отзыв' },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'На модерации', value: 'pending' },
        { label: 'Опубликован', value: 'approved' },
        { label: 'Отклонён', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
