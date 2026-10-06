/**
 * Демо-данные для проверки дизайна: вымышленные книги, авторы и чтецы с
 * пометкой isDemo. На сайте у таких карточек плашка «демо».
 *   npm run seed:demo             — создать
 *   npm run seed:demo -- --remove — удалить все демо-записи
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const payload = await getPayload({ config })
const o = { overrideAccess: true, depth: 0 } as const

async function removeAll() {
  for (const collection of ['chapters', 'books', 'series', 'authors', 'narrators'] as const) {
    if (collection === 'chapters') {
      const books = await payload.find({ collection: 'books', where: { isDemo: { equals: true } }, limit: 0, ...o })
      const ids = books.docs.map((b) => b.id)
      if (ids.length) await payload.delete({ collection: 'chapters', where: { book: { in: ids } }, ...o })
      continue
    }
    if (collection === 'series') {
      await payload.delete({ collection, where: { slug: { like: 'demo-' } }, ...o })
      continue
    }
    await payload.delete({ collection, where: { isDemo: { equals: true } }, ...o })
  }
}

if (process.argv.includes('--remove')) {
  await removeAll()
  console.log('Демо-данные удалены.')
  process.exit(0)
}
await removeAll()

const trope = async (slug: string, parentSlug?: string) => {
  const where = parentSlug
    ? { and: [{ slug: { equals: slug } }, { 'parent.slug': { equals: parentSlug } }] }
    : { and: [{ slug: { equals: slug } }, { kind: { equals: 'trope' } }] }
  const r = await payload.find({ collection: 'tropes', where: where as never, limit: 1, ...o })
  return r.docs[0]?.id
}

const narrators = []
for (const [name, voice] of [
  ['Алина Ветрова', 'Ромфант, тёплый низкий голос'],
  ['Марк Северин', 'Попаданцы и ЛитРПГ, динамично'],
  ['Ева Ланская', 'Бытовое фэнтези, с юмором'],
  ['Дина Орлова', 'Драма и измена, мягко'],
] as const)
  narrators.push(await payload.create({ collection: 'narrators', data: { name, voice, about: 'Демо-чтец для проверки дизайна.', isDemo: true, published: true }, ...o }))

const authors = []
for (const name of ['Мира Светлова', 'Ольга Зимина', 'Яна Корф', 'Лея Даль', 'Кира Морозова', 'Илья Гранин'])
  authors.push(await payload.create({ collection: 'authors', data: { name, about: 'Демо-автор для проверки дизайна.', isDemo: true, published: true }, ...o }))

const series = await payload.create({ collection: 'series', data: { title: 'Хроники Северного дома', slug: 'demo-hroniki-severnogo-doma', lead: 'Демо-серия.', published: true }, ...o })

const TINTS = ['#E9C7D2', '#F2D9C4', '#DCCBE6', '#F0C9C2', '#E8D3C9', '#D9C3D6']
type B = { title: string; tropes: string[][]; a: number; n?: number; audio?: number; status?: 'ongoing' | 'completed'; he?: 'yes' | 'no'; heat?: 'none' | 'moderate' | 'explicit'; hook: string; s?: number }
const BOOKS: B[] = [
  { title: 'Развод? С удовольствием, генерал', tropes: [['razvod-s-drakonom'], ['s-generalom', 'razvod-s-drakonom']], a: 0, n: 0, audio: 11, status: 'completed', he: 'yes', hook: 'Бывший пожалеет. ХЭ гарантирован', s: 1 },
  { title: 'Хозяйка Северного дома', tropes: [['razvod-s-drakonom'], ['posle-razvoda', 'razvod-s-drakonom']], a: 0, n: 0, audio: 9, status: 'completed', he: 'yes', hook: 'После развода — своё поместье и новая жизнь', s: 2 },
  { title: 'Жена, которую он забыл', tropes: [['zhena-generala-drakona']], a: 1, n: 3, audio: 12, status: 'completed', he: 'yes', hook: 'Генерал вернулся с войны не один' },
  { title: 'Ненужная жена ледяного лорда', tropes: [['nelyubimaya-zhena']], a: 2, audio: 0, status: 'ongoing', he: 'yes', hook: 'Сослали в дальнее поместье — и зря' },
  { title: 'Истинная по ошибке', tropes: [['istinnaya-para']], a: 3, n: 0, audio: 8, status: 'completed', he: 'yes', heat: 'moderate', hook: 'Метка проявилась не у той сестры' },
  { title: 'Отвергнутая луной', tropes: [['otvergnutaya-para'], ['alfa', 'otvergnutaya-para']], a: 4, n: 3, audio: 10, status: 'ongoing', he: 'yes', hook: 'Альфа отверг её при всей стае. Через год он приполз сам' },
  { title: 'Служанка для ректора', tropes: [['sluzhanka-rektora'], ['akademiya-drakonov']], a: 2, n: 0, audio: 7, status: 'completed', he: 'yes', hook: 'Убирать кабинет ректора — худшее наказание. Или нет' },
  { title: 'Академия Драконьего Пика', tropes: [['akademiya-drakonov'], ['rektor', 'akademiya-drakonov']], a: 3, status: 'ongoing', he: 'yes', hook: 'Адептка без дара и ректор, который всё видит' },
  { title: 'Злодейка решила жить', tropes: [['popadanka-v-zlodejku']], a: 1, n: 2, audio: 9, status: 'completed', he: 'yes', hook: 'По сюжету её казнят в финале. Сюжет придётся переписать' },
  { title: 'Пряничная лавка на Солнечной', tropes: [['hozyajka-lavki']], a: 1, n: 2, audio: 6, status: 'completed', he: 'yes', hook: 'Пряники с магией и дракон, который зашёл за покупкой' },
  { title: 'Вдова в семнадцать', tropes: [['vdova'], ['pomestye', 'vdova']], a: 4, status: 'ongoing', he: 'yes', hook: 'Наследство — руины и долги. Пока' },
  { title: 'Второй шанс для мастера', tropes: [['regressor'], ['lekar']], a: 5, n: 1, audio: 14, status: 'ongoing', he: 'yes', hook: 'Он погиб в первой жизни. Во второй — знает, где враги' },
]

let i = 0
for (const b of BOOKS) {
  const tropeIds = (await Promise.all(b.tropes.map(([s, p]) => trope(s, p)))).filter(Boolean) as number[]
  const book = await payload.create({
    collection: 'books',
    data: {
      title: b.title,
      authors: [authors[b.a].id],
      narrators: b.n !== undefined && b.audio ? [narrators[b.n].id] : [],
      tropes: tropeIds,
      hook: b.hook,
      status: b.status,
      happyEnding: b.he,
      heat: b.heat ?? 'none',
      hasAudio: Boolean(b.audio),
      audioHours: b.audio || undefined,
      coverTint: TINTS[i % TINTS.length],
      series: b.s ? { ref: series.id, order: b.s } : undefined,
      externalLinks: [{ label: 'площадке автора', url: 'https://example.com/' }],
      isDemo: true,
      published: true,
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
    } as never,
    ...o,
  })
  for (let c = 1; c <= 5; c++)
    await payload.create({ collection: 'chapters', data: { book: book.id, order: c, title: `Глава ${c}`, isFree: c === 1, published: true }, ...o })
  i++
}
console.log(`Демо: книг ${BOOKS.length}, авторов ${authors.length}, чтецов ${narrators.length}, серия 1.`)
process.exit(0)
