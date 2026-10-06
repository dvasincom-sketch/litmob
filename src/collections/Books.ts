import type { CollectionConfig } from 'payload'
import { publishedOrStaff, staffOnly } from '../access'
import { pathField, publishedField, slugField } from '../lib/landingFields'
import { joinPath, slugify } from '../lib/paths'

/**
 * Книги. На старте площадка — агрегатор: книга может быть справочной карточкой
 * (наш текст «о чём», ссылки на площадку автора, без текста и аудио), а после
 * договора с автором и чтецом — с главами и озвучкой по подписке.
 *
 * Ярлыки для читательниц (ХЭ, откровенность, предупреждения, статус) —
 * из правил голоса сайта: по ним выбирают книгу, а не по аннотации.
 */
export const Books: CollectionConfig = {
  slug: 'books',
  labels: { singular: 'Книга', plural: 'Книги' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'authors', 'status', 'hasAudio', 'published'],
    group: 'Каталог',
    listSearchableFields: ['title', 'originalTitle', 'slug'],
  },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const slug = data.slug || originalDoc?.slug || slugify(String(data.title ?? originalDoc?.title ?? ''))
        data.slug = slug
        data.path = joinPath('/kniga', slug)
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'title', type: 'text', label: 'Название', required: true },
            { name: 'authors', type: 'relationship', relationTo: 'authors', hasMany: true, label: 'Авторы' },
            { name: 'narrators', type: 'relationship', relationTo: 'narrators', hasMany: true, label: 'Чтецы' },
            { name: 'cover', type: 'upload', relationTo: 'media', label: 'Обложка', admin: { description: 'Только с разрешения правообладателя.' } },
            { name: 'about', type: 'richText', label: 'О чём книга (свой текст)', admin: { description: 'Не копия аннотации — свой текст без спойлеров.' } },
            { name: 'hook', type: 'text', label: 'Строка-крючок', admin: { description: 'Например: «Бывший пожалеет. ХЭ гарантирован».' } },
            {
              name: 'series',
              type: 'group',
              label: 'Серия',
              fields: [
                { name: 'ref', type: 'relationship', relationTo: 'series', label: 'Серия' },
                { name: 'order', type: 'number', label: 'Номер в серии' },
              ],
            },
          ],
        },
        {
          label: 'Сюжеты и ярлыки',
          fields: [
            { name: 'tropes', type: 'relationship', relationTo: 'tropes', hasMany: true, index: true, label: 'Сюжеты' },
            { name: 'genres', type: 'relationship', relationTo: 'genres', hasMany: true, index: true, label: 'Жанры' },
            {
              name: 'status',
              type: 'select',
              label: 'Статус',
              defaultValue: 'ongoing',
              options: [
                { label: 'Пишется', value: 'ongoing' },
                { label: 'Завершена', value: 'completed' },
                { label: 'Заморожена', value: 'frozen' },
              ],
            },
            {
              name: 'happyEnding',
              type: 'select',
              label: 'ХЭ',
              defaultValue: 'unknown',
              options: [
                { label: 'Да', value: 'yes' },
                { label: 'Нет', value: 'no' },
                { label: 'Не указано', value: 'unknown' },
              ],
            },
            {
              name: 'heat',
              type: 'select',
              label: 'Откровенность',
              defaultValue: 'none',
              options: [
                { label: 'Нет', value: 'none' },
                { label: 'Умеренно', value: 'moderate' },
                { label: '18+', value: 'explicit' },
              ],
            },
            {
              name: 'warnings',
              type: 'array',
              label: 'Предупреждения (без спойлеров)',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'hasAudio', type: 'checkbox', label: 'Есть озвучка', index: true },
            { name: 'audioHours', type: 'number', label: 'Часов аудио' },
          ],
        },
        {
          label: 'Доступ и ссылки',
          fields: [
            {
              name: 'mode',
              type: 'select',
              label: 'Формат на площадке',
              defaultValue: 'reference',
              options: [
                { label: 'Справочная карточка (ссылка на автора)', value: 'reference' },
                { label: 'По договору: главы и аудио', value: 'licensed' },
              ],
            },
            {
              name: 'externalLinks',
              type: 'array',
              label: 'Где читать у автора',
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Площадка' },
                { name: 'url', type: 'text', required: true, label: 'Ссылка' },
              ],
            },
            { name: 'freeChapters', type: 'number', label: 'Бесплатных глав', defaultValue: 1 },
            { name: 'claimed', type: 'checkbox', label: 'Автор подтвердил страницу' },
          ],
        },
        {
          label: 'Перевод',
          fields: [
            { name: 'isTranslation', type: 'checkbox', label: 'Лицензионный перевод' },
            { name: 'originalTitle', type: 'text', label: 'Оригинальное название', admin: { description: 'Для запросов «[название] на русском».' } },
            { name: 'translator', type: 'text', label: 'Переводчик' },
          ],
        },
      ],
    },
    { name: 'litmob', type: 'relationship', relationTo: 'litmobs', label: 'Литмоб', admin: { position: 'sidebar' } },
    slugField,
    pathField,
    publishedField,
    { name: 'publishedAt', type: 'date', label: 'Дата публикации', admin: { position: 'sidebar' } },
    { name: 'chapters', type: 'join', collection: 'chapters', on: 'book', label: 'Главы', defaultSort: 'order' },
  ],
  timestamps: true,
}
