import type { CollectionConfig } from 'payload'
import { publishedOrStaff, staffOnly } from '../access'

/**
 * Главы: текст (Lexical) и/или аудиофайл. Первые `book.freeChapters` и главы
 * с `isFree` открыты всем — это «первая глава бесплатно» со страницы книги.
 * Остальное — по подписке (гейт подключим во второй итерации вместе с ЮKassa,
 * перенос из content-box: lib/chapterAccess + api/pay).
 */
export const Chapters: CollectionConfig = {
  slug: 'chapters',
  labels: { singular: 'Глава', plural: 'Главы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'book', 'order', 'isFree', 'published'],
    group: 'Каталог',
  },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  fields: [
    { name: 'book', type: 'relationship', relationTo: 'books', required: true, index: true, label: 'Книга' },
    { name: 'order', type: 'number', label: 'Номер', defaultValue: 1, index: true },
    { name: 'title', type: 'text', label: 'Название главы', required: true },
    { name: 'body', type: 'richText', label: 'Текст' },
    { name: 'audio', type: 'upload', relationTo: 'audio', label: 'Аудио' },
    { name: 'narrator', type: 'relationship', relationTo: 'narrators', label: 'Чтец главы' },
    { name: 'isFree', type: 'checkbox', label: 'Бесплатная', defaultValue: false },
    { name: 'published', type: 'checkbox', label: 'Опубликовано', defaultValue: false, index: true },
    { name: 'publishedAt', type: 'date', label: 'Дата выхода', admin: { description: 'По ней шлём «вышла прода».' } },
  ],
  timestamps: true,
}
