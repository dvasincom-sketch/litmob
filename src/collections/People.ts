import type { CollectionConfig } from 'payload'
import { publishedOrStaff, staffOnly } from '../access'
import { pathField, publishedField, slugField } from '../lib/landingFields'
import { joinPath, slugify } from '../lib/paths'

const pathHook =
  (base: string) =>
  ({ data, originalDoc }: { data: any; originalDoc?: any }) => {
    const slug = data.slug || originalDoc?.slug || slugify(String(data.name ?? originalDoc?.name ?? ''))
    data.slug = slug
    data.path = joinPath(base, slug)
    return data
  }

/**
 * Авторы. Справочная страница «все книги по порядку» — без фото и обложек,
 * пока нет согласия; кнопка «Подтвердите страницу» связывает с аккаунтом.
 */
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Автор', plural: 'Авторы' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'path', 'claimed', 'published'], group: 'Люди' },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { beforeChange: [pathHook('/avtor')] },
  fields: [
    { name: 'name', type: 'text', label: 'Имя или псевдоним', required: true },
    { name: 'about', type: 'textarea', label: 'Коротко об авторе (свой текст)' },
    {
      name: 'links',
      type: 'array',
      label: 'Страницы автора на площадках',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'user', type: 'relationship', relationTo: 'users', label: 'Аккаунт', admin: { position: 'sidebar' } },
    { name: 'claimed', type: 'checkbox', label: 'Подтверждена автором', admin: { position: 'sidebar' } },
    slugField,
    pathField,
    publishedField,
    { name: 'books', type: 'join', collection: 'books', on: 'authors', label: 'Книги' },
  ],
}

/** Чтецы — наше отличие от конкурентов: карточка голоса, демо, все озвученные книги. */
export const Narrators: CollectionConfig = {
  slug: 'narrators',
  labels: { singular: 'Чтец', plural: 'Чтецы' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'path', 'published'], group: 'Люди' },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { beforeChange: [pathHook('/chtec')] },
  fields: [
    { name: 'name', type: 'text', label: 'Имя', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Фото' },
    { name: 'about', type: 'textarea', label: 'О чтеце' },
    { name: 'voice', type: 'text', label: 'Голос', admin: { description: 'Например: «тёплый низкий женский».' } },
    { name: 'demo', type: 'upload', relationTo: 'audio', label: 'Демо голоса' },
    {
      name: 'genres',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      label: 'В каких жанрах читает',
    },
    { name: 'user', type: 'relationship', relationTo: 'users', label: 'Аккаунт', admin: { position: 'sidebar' } },
    slugField,
    pathField,
    publishedField,
    { name: 'books', type: 'join', collection: 'books', on: 'narrators', label: 'Озвученные книги' },
  ],
}

/** Серии и циклы: «[цикл] по порядку». */
export const Series: CollectionConfig = {
  slug: 'series',
  labels: { singular: 'Серия', plural: 'Серии' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'path', 'published'], group: 'Каталог' },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const slug = data.slug || originalDoc?.slug || slugify(String(data.title ?? originalDoc?.title ?? ''))
        data.slug = slug
        data.path = joinPath('/serii', slug)
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Название цикла', required: true },
    { name: 'lead', type: 'textarea', label: 'Вводный абзац' },
    slugField,
    pathField,
    publishedField,
    { name: 'books', type: 'join', collection: 'books', on: 'series.ref', label: 'Книги', defaultSort: 'series.order' },
  ],
}
