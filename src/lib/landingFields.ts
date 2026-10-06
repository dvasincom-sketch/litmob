import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Field } from 'payload'
import { ADULT_PREFIX, joinPath, slugify } from './paths'

/**
 * Общие поля SEO-страниц-лендингов (сюжеты, жанры, подборки).
 * Каждая страница закрывает свою группу запросов: главный запрос, вводный
 * текст, вопросы-ответы. Поля спроса (частота, рост, волна) — из структуры
 * сайта, чтобы редактор видел приоритет прямо в админке.
 */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  label: 'Адрес (slug)',
  index: true,
  admin: { position: 'sidebar', description: 'Латиницей. Пусто — сгенерируется из названия.' },
}

export const pathField: Field = {
  name: 'path',
  type: 'text',
  label: 'Полный путь',
  unique: true,
  index: true,
  admin: { position: 'sidebar', readOnly: true, description: 'Вычисляется автоматически.' },
}

export const customPathField: Field = {
  name: 'customPath',
  type: 'text',
  label: 'Свой адрес',
  admin: { position: 'sidebar', description: 'Если адрес вне своего раздела: /18/omegavers/, /audio/rasskazy/.' },
}

export const subtitleField: Field = {
  name: 'subtitle',
  type: 'text',
  label: 'Подпись на плитке',
  admin: { description: 'Под названием в каталоге: «После развода, с генералом, попаданка».' },
}

export const publishedField: Field = {
  name: 'published',
  type: 'checkbox',
  label: 'Опубликовано',
  defaultValue: false,
  index: true,
  admin: { position: 'sidebar' },
}

export const demandFields: Field = {
  type: 'collapsible',
  label: 'Спрос (из семантического ядра)',
  admin: { initCollapsed: true },
  fields: [
    { name: 'mainQuery', type: 'text', label: 'Главный запрос' },
    { name: 'monthlyVolume', type: 'number', label: 'Запросов в месяц' },
    { name: 'growth', type: 'text', label: 'Рост за год', admin: { description: 'Например ×2,4 или «новый».' } },
    {
      name: 'wave',
      type: 'select',
      label: 'Волна запуска',
      options: ['1', '2', '3', '4'].map((v) => ({ label: `Волна ${v}`, value: v })),
    },
    { name: 'phrases', type: 'textarea', label: 'Фразы для текста', admin: { description: 'Через запятую.' } },
  ],
}

export const contentFields: Field[] = [
  { name: 'h1', type: 'text', label: 'Заголовок H1', admin: { description: 'Пусто — берётся название.' } },
  { name: 'lead', type: 'textarea', label: 'Вводный абзац', admin: { description: '2–3 предложения под главный запрос.' } },
  { name: 'body', type: 'richText', label: 'Текст страницы' },
  {
    name: 'faq',
    type: 'array',
    label: 'Вопросы и ответы',
    labels: { singular: 'Вопрос', plural: 'Вопросы' },
    fields: [
      { name: 'q', type: 'text', label: 'Вопрос', required: true },
      { name: 'a', type: 'textarea', label: 'Ответ', required: true },
    ],
  },
]

type PathOpts = {
  /** Корень раздела: '/tropy', '/zhanr', '/podborki' … */
  base: string
  /** Коллекция, в которой лежит родитель (для уточнений). */
  collection: 'tropes' | 'genres'
}

/** beforeChange: slug из названия + вычисление path (с учётом родителя и 18+). */
export const computePath =
  ({ base, collection }: PathOpts): CollectionBeforeChangeHook =>
  async ({ data, req, originalDoc }) => {
    const title = data.title ?? originalDoc?.title ?? ''
    const slug = data.slug || originalDoc?.slug || slugify(String(title))
    data.slug = slug
    const parentId =
      data.parent !== undefined ? data.parent : (originalDoc?.parent as unknown) ?? null
    const pid = typeof parentId === 'object' && parentId ? (parentId as { id: number }).id : parentId
    const adult = data.adult ?? originalDoc?.adult ?? false
    const custom = data.customPath ?? originalDoc?.customPath
    if (custom) {
      data.path = joinPath(custom)
    } else if (pid) {
      const parent = await req.payload.findByID({
        collection,
        id: pid as number,
        depth: 0,
        req,
        overrideAccess: true,
      })
      data.path = joinPath((parent as { path?: string }).path, slug)
    } else {
      data.path = adult ? joinPath(ADULT_PREFIX, slug) : joinPath(base, slug)
    }
    return data
  }

/** afterChange: если сменился путь родителя — пересчитываем пути детей. */
export const cascadePath =
  (collection: 'tropes' | 'genres'): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req }) => {
    if (!previousDoc || previousDoc.path === doc.path) return doc
    const children = await req.payload.find({
      collection,
      where: { parent: { equals: doc.id } },
      limit: 0,
      depth: 0,
      req,
      overrideAccess: true,
    })
    for (const child of children.docs) {
      await req.payload.update({
        collection,
        id: child.id,
        data: { parent: doc.id },
        req,
        overrideAccess: true,
      })
    }
    return doc
  }
