import type { CollectionConfig } from 'payload'
import { publishedOrStaff, staffOnly } from '../access'
import { contentFields, demandFields, pathField, publishedField } from '../lib/landingFields'
import { joinPath } from '../lib/paths'

/**
 * Контентные страницы: для чтецов и авторов (/chtecam/, /ozvuchka-knig/,
 * /avtoram/…), сравнение площадок, о проекте, подписка. Адрес задаётся целиком.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'path', 'section', 'published'], group: 'Контент' },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        data.path = joinPath(data.path ?? originalDoc?.path ?? '')
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true },
    {
      name: 'section',
      type: 'select',
      label: 'Раздел',
      defaultValue: 'service',
      options: [
        { label: 'Чтецам', value: 'narrators' },
        { label: 'Авторам', value: 'authors' },
        { label: 'Статья', value: 'article' },
        { label: 'Служебная', value: 'service' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'cta', type: 'group', label: 'Кнопка', fields: [{ name: 'label', type: 'text' }, { name: 'href', type: 'text' }] },
    ...contentFields,
    demandFields,
    { ...pathField, admin: { position: 'sidebar', description: 'Полный адрес, например /avtoram/kak-napisat-knigu/' } } as typeof pathField,
    publishedField,
  ],
  timestamps: true,
}
