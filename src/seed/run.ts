/**
 * Наполнение волны 1. Идемпотентно: повторный запуск обновляет записи по slug.
 *   npm run seed
 * Администратор создаётся, если заданы SEED_ADMIN_EMAIL и SEED_ADMIN_PASSWORD.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { FAMILIES, GENRES, REFINEMENTS, TROPES, type SeedTrope } from './wave1'

const payload = await getPayload({ config })
const ids = new Map<string, number>()

async function upsert(collection: 'tropes' | 'genres', where: any, data: any) {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true })
  if (found.docs[0]) {
    const doc = await payload.update({ collection, id: found.docs[0].id, data, overrideAccess: true })
    return doc.id as number
  }
  const doc = await payload.create({ collection, data, overrideAccess: true })
  return doc.id as number
}

const tropeData = (t: SeedTrope) => ({
  title: t.title,
  slug: t.slug,
  kind: t.kind,
  family: t.family?.map((k) => ids.get(k)!).filter(Boolean),
  parent: t.parent ? ids.get(t.parent) : undefined,
  audioOnly: t.audioOnly ?? false,
  adult: t.adult ?? false,
  h1: t.h1,
  lead: t.lead,
  faq: t.faq,
  mainQuery: t.mainQuery,
  monthlyVolume: t.monthlyVolume,
  growth: t.growth,
  wave: t.wave,
  phrases: t.phrases,
  published: true,
})

for (const t of FAMILIES) ids.set(t.key, await upsert('tropes', { and: [{ slug: { equals: t.slug } }, { kind: { equals: 'family' } }] }, tropeData(t)))
for (const t of TROPES) ids.set(t.key, await upsert('tropes', { and: [{ slug: { equals: t.slug } }, { kind: { equals: 'trope' } }] }, tropeData(t)))
for (const t of REFINEMENTS)
  ids.set(t.key, await upsert('tropes', { and: [{ slug: { equals: t.slug } }, { parent: { equals: ids.get(t.parent!) } }] }, tropeData(t)))
// Похожие сюжеты — вторым проходом, когда известны все id.
for (const t of TROPES)
  if (t.related?.length)
    await payload.update({ collection: 'tropes', id: ids.get(t.key)!, data: { related: t.related.map((k) => ids.get(k)!) }, overrideAccess: true })

const gids = new Map<string, number>()
for (const g of GENRES) {
  const parent = 'parent' in g && g.parent ? gids.get(g.parent) : undefined
  const id = await upsert('genres', parent ? { and: [{ slug: { equals: g.slug } }, { parent: { equals: parent } }] } : { and: [{ slug: { equals: g.slug } }, { parent: { exists: false } }] }, {
    title: g.title,
    slug: g.slug,
    parent,
    audioOnly: 'audioOnly' in g ? g.audioOnly : false,
    h1: g.h1,
    lead: g.lead,
    mainQuery: g.mainQuery,
    monthlyVolume: g.monthlyVolume,
    growth: g.growth,
    wave: g.wave,
    tropes: 'tropes' in g ? g.tropes?.map((k) => ids.get(k)!) : undefined,
    published: true,
  })
  gids.set(g.key, id)
}

// Первый литмоб площадки — из брифа конкурса «Развод с драконом».
const mob = await payload.find({ collection: 'litmobs', where: { slug: { equals: 'razvod-s-drakonom' } }, limit: 1, overrideAccess: true })
const mobData = {
  title: 'Развод с драконом',
  slug: 'razvod-s-drakonom',
  status: 'recruiting' as const,
  trope: ids.get('razvod'),
  pitch: 'Первый литмоб площадки: книги о том, как героиня уходит от дракона и строит свою жизнь. Победителя озвучит профессиональный чтец.',
  mustHave: [{ text: 'Развод или уход от мужа-дракона в первых главах' }, { text: 'Героиня сама строит новую жизнь: дело, дом, свои деньги' }, { text: 'ХЭ' }],
  forbidden: [{ text: 'Возвращение к бывшему без его расплаты' }],
  rating: 'general' as const,
  happyEndingRequired: true,
  maxParticipants: 15,
  joinMode: 'application' as const,
  narratorsWelcome: true,
  readerVoting: true,
  prize: 'Профессиональная озвучка книги-победителя',
}
if (mob.docs[0]) await payload.update({ collection: 'litmobs', id: mob.docs[0].id, data: mobData, overrideAccess: true })
else await payload.create({ collection: 'litmobs', data: mobData, overrideAccess: true })

await payload.updateGlobal({ slug: 'site-settings', data: { siteName: 'Литмоб' }, overrideAccess: true })

if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  const u = await payload.find({ collection: 'users', where: { email: { equals: process.env.SEED_ADMIN_EMAIL } }, limit: 1, overrideAccess: true })
  if (!u.docs[0])
    await payload.create({ collection: 'users', data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, name: 'Администратор', roles: ['admin'] }, overrideAccess: true })
}

console.log(`Готово: семейств ${FAMILIES.length}, сюжетов ${TROPES.length}, уточнений ${REFINEMENTS.length}, жанров ${GENRES.length}, литмоб 1.`)
process.exit(0)
