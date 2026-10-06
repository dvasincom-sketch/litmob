import type { Access, CollectionConfig, Where } from 'payload'
import { hasRole, isStaff, staffOnly } from '../access'
import { pathField, slugField } from '../lib/landingFields'
import { joinPath, slugify } from '../lib/paths'

const PUBLIC_STATUSES = ['recruiting', 'running', 'voting', 'finished']

/** Публично видны литмобы после модерации; организатор видит свои; персонал — все. */
const readLitmob: Access = ({ req }) => {
  const user = req.user as any
  if (isStaff(user)) return true
  const pub = { status: { in: PUBLIC_STATUSES } }
  if (!user) return pub
  const where: Where = { or: [pub, { organizer: { equals: user.id } }] }
  return where
}

/** Создать литмоб может автор (или персонал). Статус новой заявки — модерация. */
const createLitmob: Access = ({ req }) => hasRole(req.user as any, 'author', 'admin', 'editor')

/** Организатор правит свой литмоб, пока он не запущен; персонал — всегда. */
const updateLitmob: Access = ({ req }) => {
  const user = req.user as any
  if (isStaff(user)) return true
  if (!user) return false
  const where: Where = { and: [{ organizer: { equals: user.id } }, { status: { in: ['draft', 'moderation', 'recruiting'] } }] }
  return where
}

/**
 * Литмоб — серия книг разных авторов на один сюжет по общим правилам.
 * Конструктор «Создать литмоб» на сайте заполняет эти же поля по шагам:
 * тема → обязательные элементы и запреты → рамки книги → сроки →
 * участники → оформление → озвучка → финал.
 */
export const Litmobs: CollectionConfig = {
  slug: 'litmobs',
  labels: { singular: 'Литмоб', plural: 'Литмобы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'organizer', 'status', 'startAt', 'finishAt'],
    group: 'Литмобы',
  },
  access: { read: readLitmob, create: createLitmob, update: updateLitmob, delete: staffOnly },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req, operation }) => {
        const slug = data.slug || originalDoc?.slug || slugify(String(data.title ?? originalDoc?.title ?? ''))
        data.slug = slug
        data.path = joinPath('/litmoby', slug)
        // Автор не может сам себя «промодерировать». Системные вызовы (без
        // пользователя: сид, крон) и персонал ограничений не имеют.
        const actor = req.user as any
        if (!actor || isStaff(actor)) return data
        if (operation === 'create') {
          data.status = 'moderation'
          data.organizer = (req.user as any)?.id
        }
        if (operation === 'update' && data.status && !['draft', 'moderation'].includes(data.status)) {
          data.status = originalDoc?.status
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Название литмоба', required: true },
    { name: 'organizer', type: 'relationship', relationTo: 'users', label: 'Организатор', admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'На модерации', value: 'moderation' },
        { label: 'Набор участников', value: 'recruiting' },
        { label: 'Идёт', value: 'running' },
        { label: 'Голосование', value: 'voting' },
        { label: 'Завершён', value: 'finished' },
        { label: 'Отклонён', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: '1. Тема',
          fields: [
            { name: 'trope', type: 'relationship', relationTo: 'tropes', label: 'Сюжет' },
            { name: 'customTheme', type: 'text', label: 'Своя тема', admin: { description: 'Если подходящего сюжета нет в каталоге.' } },
            { name: 'pitch', type: 'textarea', label: 'О чём литмоб', required: true },
          ],
        },
        {
          label: '2. Границы',
          fields: [
            { name: 'mustHave', type: 'array', label: 'Обязательные элементы', maxRows: 7, fields: [{ name: 'text', type: 'text', required: true }] },
            { name: 'forbidden', type: 'array', label: 'Запреты', fields: [{ name: 'text', type: 'text', required: true }] },
          ],
        },
        {
          label: '3. Рамки книги',
          fields: [
            { name: 'minChars', type: 'number', label: 'Объём от, знаков' },
            { name: 'maxChars', type: 'number', label: 'Объём до, знаков' },
            {
              name: 'rating',
              type: 'select',
              label: 'Рейтинг',
              defaultValue: 'general',
              options: [
                { label: 'Без 18+', value: 'general' },
                { label: '18+', value: 'adult' },
              ],
            },
            { name: 'happyEndingRequired', type: 'checkbox', label: 'ХЭ обязателен' },
            {
              name: 'pov',
              type: 'select',
              label: 'От чьего лица',
              options: [
                { label: 'Любое', value: 'any' },
                { label: 'От первого лица', value: 'first' },
                { label: 'От третьего лица', value: 'third' },
              ],
            },
          ],
        },
        {
          label: '4. Сроки',
          fields: [
            { name: 'applicationsUntil', type: 'date', label: 'Приём заявок до' },
            { name: 'startAt', type: 'date', label: 'Старт' },
            { name: 'firstChapterBy', type: 'date', label: 'Первая глава до' },
            { name: 'chaptersPerWeek', type: 'number', label: 'Глав в неделю, минимум' },
            { name: 'finishAt', type: 'date', label: 'Финал' },
          ],
        },
        {
          label: '5. Участники',
          fields: [
            { name: 'maxParticipants', type: 'number', label: 'Максимум авторов', defaultValue: 12, min: 3, max: 30 },
            {
              name: 'joinMode',
              type: 'select',
              label: 'Как вступить',
              defaultValue: 'application',
              options: [
                { label: 'Открытый набор', value: 'open' },
                { label: 'По заявке с синопсисом', value: 'application' },
                { label: 'По приглашению', value: 'invite' },
              ],
            },
          ],
        },
        {
          label: '6–8. Оформление, озвучка, финал',
          fields: [
            { name: 'badge', type: 'upload', relationTo: 'media', label: 'Плашка литмоба на обложки' },
            { name: 'coverStyle', type: 'textarea', label: 'Требования к обложкам' },
            { name: 'narratorsWelcome', type: 'checkbox', label: 'Чтецы могут предложить озвучку', defaultValue: true },
            { name: 'readerVoting', type: 'checkbox', label: 'Голосование читателей', defaultValue: true },
            { name: 'prize', type: 'text', label: 'Приз', admin: { description: 'Например: профессиональная озвучка победителя.' } },
          ],
        },
      ],
    },
    {
      name: 'moderationNote',
      type: 'textarea',
      label: 'Комментарий модератора',
      access: { update: ({ req }) => isStaff(req.user as any) },
      admin: { position: 'sidebar' },
    },
    slugField,
    pathField,
    { name: 'entries', type: 'join', collection: 'litmob-entries', on: 'litmob', label: 'Участники' },
  ],
  timestamps: true,
}

/** Заявки и участники литмоба: автор + синопсис + (после одобрения) книга. */
export const LitmobEntries: CollectionConfig = {
  slug: 'litmob-entries',
  labels: { singular: 'Участник литмоба', plural: 'Участники литмобов' },
  admin: { useAsTitle: 'id', defaultColumns: ['litmob', 'author', 'book', 'status'], group: 'Литмобы' },
  access: {
    read: () => true,
    create: ({ req }) => hasRole(req.user as any, 'author', 'admin', 'editor'),
    update: ({ req }) => {
      const user = req.user as any
      if (isStaff(user)) return true
      if (!user) return false
      return { author: { equals: user.id } }
    },
    delete: staffOnly,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        const actor = req.user as any
        if (actor && !isStaff(actor)) {
          if (operation === 'create') {
            data.author = (req.user as any)?.id
            data.status = 'pending'
          } else {
            data.status = originalDoc?.status
          }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'litmob', type: 'relationship', relationTo: 'litmobs', required: true, index: true, label: 'Литмоб' },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true, label: 'Автор' },
    { name: 'synopsis', type: 'textarea', label: 'Синопсис' },
    { name: 'book', type: 'relationship', relationTo: 'books', label: 'Книга' },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'pending',
      options: [
        { label: 'Заявка', value: 'pending' },
        { label: 'Принят', value: 'approved' },
        { label: 'Отклонён', value: 'rejected' },
        { label: 'Выбыл', value: 'dropped' },
      ],
    },
    { name: 'votes', type: 'number', label: 'Голоса читателей', defaultValue: 0, admin: { readOnly: true } },
  ],
  timestamps: true,
}
