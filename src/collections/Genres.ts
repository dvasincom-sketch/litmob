import type { CollectionConfig } from 'payload'
import { publishedOrStaff, staffOnly } from '../access'
import {
  cascadePath,
  computePath,
  contentFields,
  customPathField,
  subtitleField,
  demandFields,
  pathField,
  publishedField,
  slugField,
} from '../lib/landingFields'

/**
 * Жанры и аудиохабы: /zhanr/bytovoe-fentezi/, /zhanr/bytovoe-fentezi/audio/.
 * Жанр — хаб над сюжетами (ссылки вниз, на /tropy/), сам закрывает
 * «жанр + читать / слушать». Аудиоподстраница — уточнение с audioOnly.
 */
export const Genres: CollectionConfig = {
  slug: 'genres',
  labels: { singular: 'Жанр', plural: 'Жанры' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'wave', 'published'],
    group: 'Каталог',
  },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    beforeChange: [computePath({ base: '/zhanr', collection: 'genres' })],
    afterChange: [cascadePath('genres')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true },
    { name: 'parent', type: 'relationship', relationTo: 'genres', label: 'Родительский жанр' },
    { name: 'audioOnly', type: 'checkbox', label: 'Аудиостраница' },
    { name: 'adult', type: 'checkbox', label: '18+', admin: { position: 'sidebar' } },
    { name: 'tropes', type: 'relationship', relationTo: 'tropes', hasMany: true, label: 'Сюжеты жанра' },
    subtitleField,
    ...contentFields,
    demandFields,
    slugField,
    customPathField,
    pathField,
    publishedField,
  ],
  timestamps: true,
}
