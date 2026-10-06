/**
 * Наполнение всей структуры сайта. Идемпотентно: повторный запуск обновляет
 * записи (по slug + родителю), ничего не дублирует.
 *   npm run seed
 * Администратор создаётся, если заданы SEED_ADMIN_EMAIL и SEED_ADMIN_PASSWORD.
 */
import 'dotenv/config'
import { getPayload, type Where } from 'payload'
import config from '../payload.config'
import { COLLECTIONS, FAMILIES, GENRES, PAGES } from './structure'

const payload = await getPayload({ config })
const o = { overrideAccess: true, depth: 0 } as const

type Coll = 'tropes' | 'genres' | 'collections' | 'pages'
async function upsert(collection: Coll, where: Where, data: Record<string, unknown>) {
  const found = await payload.find({ collection, where, limit: 1, ...o })
  if (found.docs[0]) return (await payload.update({ collection, id: found.docs[0].id, data, ...o })).id as number
  return (await payload.create({ collection, data: data as never, ...o })).id as number
}
const demand = (x: { q?: string; v?: number; g?: string; w: string }) => ({ mainQuery: x.q, monthlyVolume: x.v, growth: x.g, wave: x.w })

const tropeIds = new Map<string, number>()
let nTropes = 0
let nRefs = 0

for (const f of FAMILIES) {
  const fid = await upsert('tropes', { and: [{ slug: { equals: f.slug } }, { kind: { equals: 'family' } }] }, {
    title: f.title, slug: f.slug, kind: 'family', h1: f.h1, lead: f.lead, mainQuery: f.title.toLowerCase(), wave: '1', published: true,
  })
  for (const t of f.tropes) {
    const id = await upsert('tropes', { and: [{ slug: { equals: t.slug } }, { kind: { equals: 'trope' } }] }, {
      title: t.title, slug: t.slug, kind: 'trope', family: [fid], h1: t.h1, lead: t.lead, subtitle: t.sub, faq: t.faq,
      adult: t.adult ?? false, customPath: t.customPath, published: true, ...demand(t),
    })
    tropeIds.set(t.slug, id)
    nTropes++
    for (const r of t.refs ?? []) {
      await upsert('tropes', { and: [{ slug: { equals: r.slug } }, { parent: { equals: id } }] }, {
        title: r.title, slug: r.slug, kind: 'refinement', parent: id, audioOnly: r.audio ?? false, adult: t.adult ?? false,
        // «С генералом», «После развода» читаются только вместе с сюжетом; остальные уточнения — самостоятельные.
        h1: r.audio ? `${t.title}: аудиокниги` : /^(С|После) /.test(r.title) ? `${t.title}: ${r.title.toLowerCase()}` : `${r.title}: книги и аудиокниги`,
        lead: r.lead ?? (r.audio ? `Аудиокниги по сюжету «${t.title}» в исполнении профессиональных чтецов. Первая глава бесплатно.` : `${t.lead} Подборка книг с уточнением «${r.title.toLowerCase()}».`),
        published: true, ...demand(r),
      })
      nRefs++
    }
  }
}
// Похожие сюжеты — вторым проходом, когда известны все id.
for (const f of FAMILIES)
  for (const t of f.tropes)
    if (t.related?.length)
      await payload.update({ collection: 'tropes', id: tropeIds.get(t.slug)!, data: { related: t.related.map((s) => tropeIds.get(s)!).filter(Boolean) }, ...o })

const genreIds = new Map<string, number>()
for (const g of GENRES) {
  const parent = g.parent ? genreIds.get(g.parent) : undefined
  const where: Where = parent ? { and: [{ slug: { equals: g.slug } }, { parent: { equals: parent } }] } : { and: [{ slug: { equals: g.slug } }, { parent: { exists: false } }] }
  const id = await upsert('genres', where, {
    title: g.title, slug: g.slug, parent, audioOnly: g.audio ?? false, customPath: g.customPath, subtitle: g.sub,
    h1: g.audio ? `${GENRES.find((x) => x.slug === g.parent && !x.parent)?.title}: аудиокниги` : `${g.title}: книги и аудиокниги`,
    lead: g.lead, tropes: g.tropes?.map((s) => tropeIds.get(s)!).filter(Boolean), published: true, ...demand(g),
  })
  if (!parent) genreIds.set(g.slug, id)
}

for (const c of COLLECTIONS)
  await upsert('collections', { slug: { equals: c.slug } }, {
    title: c.title, slug: c.slug, subtitle: c.sub, adult: c.adult ?? false, customPath: c.customPath, audioOnly: c.audio ?? false,
    tropes: c.tropes?.map((s) => tropeIds.get(s)!).filter(Boolean), h1: c.title, lead: c.lead, published: true, ...demand(c),
  })

for (const p of PAGES)
  await upsert('pages', { path: { equals: p.path } }, { title: p.title, path: p.path, section: p.section, h1: p.title, lead: p.lead, cta: p.cta, published: true, ...demand(p) })

// Первый литмоб площадки — из брифа конкурса «Развод с драконом».
const mobData = {
  title: 'Развод с драконом', slug: 'razvod-s-drakonom', status: 'recruiting' as const, trope: tropeIds.get('razvod-s-drakonom'),
  pitch: 'Первый литмоб площадки: книги о том, как героиня уходит от дракона и строит свою жизнь. Победителя озвучит профессиональный чтец.',
  mustHave: [{ text: 'Развод или уход от мужа-дракона в первых главах' }, { text: 'Героиня сама строит новую жизнь: дело, дом, свои деньги' }, { text: 'ХЭ' }],
  forbidden: [{ text: 'Возвращение к бывшему без его расплаты' }],
  rating: 'general' as const, happyEndingRequired: true, maxParticipants: 15, joinMode: 'application' as const,
  narratorsWelcome: true, readerVoting: true, prize: 'Профессиональная озвучка книги-победителя',
}
const mob = await payload.find({ collection: 'litmobs', where: { slug: { equals: mobData.slug } }, limit: 1, ...o })
if (mob.docs[0]) await payload.update({ collection: 'litmobs', id: mob.docs[0].id, data: mobData, ...o })
else await payload.create({ collection: 'litmobs', data: mobData, ...o })

await payload.updateGlobal({ slug: 'site-settings', data: { siteName: 'Литмоб' }, overrideAccess: true })

if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  const u = await payload.find({ collection: 'users', where: { email: { equals: process.env.SEED_ADMIN_EMAIL } }, limit: 1, ...o })
  if (!u.docs[0])
    await payload.create({ collection: 'users', data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, name: 'Администратор', roles: ['admin'] }, ...o })
}

console.log(`Готово: семейств ${FAMILIES.length}, сюжетов ${nTropes}, уточнений ${nRefs}, жанровых страниц ${GENRES.length}, подборок ${COLLECTIONS.length}, страниц ${PAGES.length}, литмоб 1.`)
process.exit(0)
