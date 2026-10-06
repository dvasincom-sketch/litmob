/**
 * Тексты страниц из репозитория → поле «Текст страницы» (body) и FAQ в базе.
 *
 *   content/pages/*.md    — контентные страницы (коллекция pages)
 *   content/landing/*.md  — сюжеты, жанры, подборки (tropes / genres / collections)
 *
 * Формат файла:
 *   ---
 *   path: /tropy/razvod-s-drakonom/
 *   collection: tropes        # только для content/landing
 *   ---
 *   Markdown: абзацы, ## H2, ### H3, списки, **жирный**, [ссылки](/tropy/…/).
 *   ## Частые вопросы          # необязательно: всё ниже уходит в FAQ
 *   ### Вопрос?
 *   Ответ.
 *
 * По умолчанию заполняет только пустые поля — правки редактора в админке не трогаются.
 * Новые вопросы FAQ добавляются к существующим (без дублей), в том числе с --force.
 *   npm run seed:content            — заполнить пустой текст
 *   npm run seed:content -- --force — перезаписать текст страниц из файлов
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import config from '@payload-config'
import { getPayload } from 'payload'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

type Coll = 'pages' | 'tropes' | 'genres' | 'collections'
type Faq = { q: string; a: string }

const force = process.argv.includes('--force')
const ROOT = path.join(process.cwd(), 'content')
const FAQ_HEADING = /^##\s+(Частые вопросы|Вопросы и ответы)\s*$/im

function parse(raw: string) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error('нет блока --- path: … ---')
  const meta = Object.fromEntries(
    m[1].split('\n').filter((l) => l.includes(':')).map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]),
  ) as Record<string, string>
  let body = m[2].trim()
  const faq: Faq[] = []
  const at = body.search(FAQ_HEADING)
  if (at >= 0) {
    const tail = body.slice(at).replace(FAQ_HEADING, '')
    body = body.slice(0, at).trim()
    for (const block of tail.split(/^###\s+/m).slice(1)) {
      const [q, ...rest] = block.split('\n')
      const a = rest.join('\n').trim().replace(/\n+/g, ' ')
      if (q.trim() && a) faq.push({ q: q.trim(), a })
    }
  }
  return { meta, body, faq }
}

const isEmptyRich = (v: unknown) => {
  if (!v || typeof v !== 'object') return true
  const kids = (v as { root?: { children?: { children?: { text?: string }[] }[] } }).root?.children || []
  return !kids.some((k) => (k.children || []).some((c) => (c.text || '').trim()))
}

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const o = { overrideAccess: true, depth: 0 } as const

let updated = 0
let skipped = 0
const missing: string[] = []

for (const dir of ['pages', 'landing']) {
  const files = (await readdir(path.join(ROOT, dir)).catch(() => [] as string[])).filter((f) => f.endsWith('.md')).sort()
  for (const f of files) {
    const { meta, body, faq } = parse(await readFile(path.join(ROOT, dir, f), 'utf8'))
    const collection = (dir === 'pages' ? 'pages' : meta.collection) as Coll
    const found = await payload.find({ collection, where: { path: { equals: meta.path } }, limit: 1, ...o })
    const doc = found.docs[0] as unknown as { id: number; body?: unknown; faq?: Faq[] | null } | undefined
    if (!doc) {
      missing.push(`${collection} ${meta.path} (${f})`)
      continue
    }
    const data: Record<string, unknown> = {}
    if (body && (force || isEmptyRich(doc.body))) data.body = convertMarkdownToLexical({ editorConfig, markdown: body })
    if (faq.length) {
      const have = (doc.faq || []).map((x) => ({ q: x.q, a: x.a }))
      // Вопросы из файла добавляются к уже существующим (в том числе из сида и админки), без дублей.
      const merged = [...have, ...faq.filter((x) => !have.some((h) => h.q.toLowerCase() === x.q.toLowerCase()))]
      if (merged.length !== have.length) data.faq = merged
    }
    if (!Object.keys(data).length) {
      skipped++
      continue
    }
    await payload.update({ collection, id: doc.id, data, ...o })
    updated++
  }
}

console.log(`Тексты: обновлено ${updated}, без изменений ${skipped}${missing.length ? `, не найдено ${missing.length}:\n  ${missing.join('\n  ')}` : ''}.`)
process.exit(0)
