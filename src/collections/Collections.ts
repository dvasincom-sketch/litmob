import type { CollectionConfig } from 'payload'
import { publishedOrStaff, staffOnly } from '../access'
import { contentFields, customPathField, demandFields, pathField, publishedField, slugField, subtitleField } from '../lib/landingFields'
import { ADULT_PREFIX, joinPath, slugify } from '../lib/paths'

/**
 * Подборки: «лучшие / новинки / 2026 / книги с драконами» — запросы, которые
 * не ложатся ни на жанр, ни на сюжет. Книги — по правилу (сюжеты, жанры, только
 * аудио) и/или вручную. Год меняем в заголовке, адрес оставляем.
 */
export const Collections: CollectionConfig = {
  slug: 'collections',
  labels: { singular: 'Подборка', plural: 'Подборки' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'path', 'wave', 'published'], group: 'Каталог' },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const slug = data.slug || originalDoc?.slug || slugify(String(data.title ?? originalDoc?.title ?? ''))
        data.slug = slug
        const custom = data.customPath ?? originalDoc?.customPath
        const adult = data.adult ?? originalDoc?.adult
        data.path = custom ? joinPath(custom) : adult ? joinPath(ADULT_PREFIX, 'podborki', slug) : joinPath('/podborki', slug)
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true },
    subtitleField,
    { name: 'adult', type: 'checkbox', label: '18+', admin: { position: 'sidebar' } },
    {
      type: 'collapsible',
      label: 'Какие книги показывать',
      fields: [
        { name: 'tropes', type: 'relationship', relationTo: 'tropes', hasMany: true, label: 'Книги с сюжетами' },
        { name: 'genres', type: 'relationship', relationTo: 'genres', hasMany: true, label: 'Книги жанров' },
        { name: 'audioOnly', type: 'checkbox', label: 'Только с озвучкой' },
        { name: 'books', type: 'relationship', relationTo: 'books', hasMany: true, label: 'Вручную (в этом порядке)' },
      ],
    },
    ...contentFields,
    demandFields,
    slugField,
    customPathField,
    pathField,
    publishedField,
  ],
  timestamps: true,
}
