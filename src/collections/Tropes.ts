import type { CollectionConfig } from 'payload'
import { publishedOrStaff, staffOnly } from '../access'
import {
  cascadePath,
  computePath,
  contentFields,
  demandFields,
  pathField,
  publishedField,
  slugField,
} from '../lib/landingFields'

/**
 * Сюжеты (тропы) — главный источник поискового трафика.
 *
 * Иерархия трёхуровневая: семейство → сюжет → уточнение.
 *  - kind=family     хаб семейства, /tropy/brak-i-razvod/
 *  - kind=trope      сюжет, адрес плоский: /tropy/razvod-s-drakonom/
 *  - kind=refinement уточнение, вложено в сюжет: /tropy/razvod-s-drakonom/audio/
 *
 * Семейство у сюжета — отдельное поле `family`, а не `parent`: так адрес сюжета
 * не зависит от семейства, и сюжет может стоять в двух семействах сразу.
 * `adult` уводит страницу в раздел /18/ (омегаверс и т. п.).
 */
export const Tropes: CollectionConfig = {
  slug: 'tropes',
  labels: { singular: 'Сюжет', plural: 'Сюжеты' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'path', 'wave', 'published'],
    group: 'Каталог',
    listSearchableFields: ['title', 'slug', 'mainQuery'],
  },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    beforeChange: [computePath({ base: '/tropy', collection: 'tropes' })],
    afterChange: [cascadePath('tropes')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true },
    {
      name: 'kind',
      type: 'select',
      label: 'Уровень',
      required: true,
      defaultValue: 'trope',
      options: [
        { label: 'Семейство (хаб)', value: 'family' },
        { label: 'Сюжет', value: 'trope' },
        { label: 'Уточнение', value: 'refinement' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'family',
      type: 'relationship',
      relationTo: 'tropes',
      hasMany: true,
      label: 'Семейства',
      filterOptions: { kind: { equals: 'family' } },
      admin: { condition: (_, s) => s?.kind === 'trope' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'tropes',
      label: 'Родительский сюжет',
      filterOptions: { kind: { equals: 'trope' } },
      admin: { condition: (_, s) => s?.kind === 'refinement' },
    },
    {
      name: 'audioOnly',
      type: 'checkbox',
      label: 'Аудиостраница',
      admin: { description: 'Показывать только книги с озвучкой.', condition: (_, s) => s?.kind === 'refinement' },
    },
    {
      name: 'adult',
      type: 'checkbox',
      label: '18+',
      admin: { position: 'sidebar', description: 'Раздел /18/ и возрастное окно.' },
    },
    { name: 'related', type: 'relationship', relationTo: 'tropes', hasMany: true, label: 'Похожие сюжеты' },
    ...contentFields,
    demandFields,
    slugField,
    pathField,
    publishedField,
    {
      name: 'books',
      type: 'join',
      collection: 'books',
      on: 'tropes',
      label: 'Книги',
      admin: { allowCreate: false },
    },
  ],
  timestamps: true,
}
