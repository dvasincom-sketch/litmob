import type { Collection, Genre, Trope } from '@/payload-types'
import { booksPhrase, brand, cap, clip, low, plural, sentences } from './seo'

type Kind = 'tropes' | 'genres' | 'collections'
type Doc = Trope | Genre | Collection

export type LandingSeo = {
  title: string
  description: string
  h1: string
  kicker: string
  h2: { list: string; audio: string; series: string; children: string; tiles: string; faq: string; related: string }
}

const YEAR = new Date().getFullYear()
/** Первый вариант хвоста, при котором title укладывается в 70 символов. */
const fit = (head: string, tails: string[]) => head + (tails.find((t) => (head + t).length <= 70) ?? tails[tails.length - 1])
const q = (s: string) => `«${s}»`
/** Уточнение вида «С генералом», «После развода» читается как продолжение родителя. */
const isContinuation = (t: string) => /^(с|со|после|в|во|к|на|про|без|от|для)\s/i.test(t)

/**
 * Шаблоны title / description / H1 / H2 для сюжетов, жанров и подборок.
 * Главный запрос (mainQuery) — в начале title; H1 — человеческое название с «книги и аудиокниги».
 */
export function landingSeo(kind: Kind, input: { doc: Doc; parent?: Trope | Genre | null; totalBooks: number; audioCount: number; tiles?: Trope[] }): LandingSeo {
  const { doc, parent, totalBooks: n, audioCount: a, tiles = [] } = input
  const T = doc.title
  const P = parent?.title
  const adult = 'adult' in doc && doc.adult
  const audio = 'audioOnly' in doc && Boolean(doc.audioOnly)
  const isFamily = kind === 'tropes' && (doc as Trope).kind === 'family'
  const mq = cap(doc.mainQuery || '')
  const lead = doc.lead || ''
  const counts = n ? booksPhrase(n, audio ? 0 : a) : ''
  const plus18 = adult ? ' 18+' : ''
  const freeFirst = 'первая глава в аудио бесплатно'

  // Ключ страницы: главный запрос, если он отличается от названия (уточнения), иначе название —
  // так сохраняется написание вроде «СССР».
  const key = mq && mq.toLowerCase() !== T.toLowerCase() ? mq : T
  // Тема, о которой страница: у аудио — родитель, у уточнений — главный запрос.
  const topic = audio && P ? P : parent ? key : T
  const TROPE_TAILS = [': книги — читать и слушать аудиокниги онлайн', ': книги — читать и слушать аудиокниги', ': книги и аудиокниги — читать и слушать', ': книги и аудиокниги']

  let title: string
  let h1: string
  let description: string
  let kicker: string

  if (kind === 'collections') {
    const hasYear = /\b20\d\d\b/.test(T)
    h1 = doc.h1 && doc.h1 !== T ? doc.h1 : audio ? `${T}: слушать онлайн` : `${T}: список книг и аудиокниг`
    title = audio ? `${T}: слушать онлайн${plus18}` : `${T}: список${hasYear ? '' : ` ${YEAR}`} — читать и слушать${plus18}`
    description = sentences(`${T}${counts ? `: ${counts}` : ''}`, lead, audio ? 'Первая глава бесплатно, профессиональные чтецы' : `Топ и новинки, серии по порядку, ${freeFirst}`)
    kicker = 'Подборка'
  } else if (audio) {
    const base = P || T
    h1 = `Аудиокниги ${q(base)}: слушать онлайн`
    title = fit(base, [` — аудиокниги слушать онлайн${plus18}, первая глава бесплатно`, ` — аудиокниги слушать онлайн${plus18}`, `: аудиокниги${plus18}`])
    const k = a || n
    description = sentences(`Слушать аудиокниги ${q(base)} онлайн${k ? `: ${k} ${plural(k, 'аудиокнига', 'аудиокниги', 'аудиокниг')}` : ''}`, 'Профессиональные чтецы, первая глава бесплатно, дальше — по подписке', lead)
    kicker = 'Аудиокниги'
  } else if (isFamily) {
    h1 = doc.h1 || `${T}: сюжеты любовного фэнтези`
    const names = tiles.slice(0, 4).map((t) => low(t.title)).join(', ')
    title = fit(T, [`: книги и аудиокниги по сюжетам${plus18}`, `: книги и аудиокниги${plus18}`])
    description = sentences(`${T}: ${names}${tiles.length > 4 ? ' и другие сюжеты' : ''}`, lead, `Книги и аудиокниги по порядку, ${freeFirst}`)
    kicker = 'Сюжеты'
  } else if (parent) {
    h1 = doc.h1 || (isContinuation(T) && P ? `${P}: ${low(T)}` : `${T}: книги и аудиокниги`)
    title = fit(key, TROPE_TAILS.map((t) => t + plus18))
    description = sentences(`${key}${counts ? ` — ${counts}` : ': книги и аудиокниги'}`, lead || (P ? `Уточнение сюжета ${q(P)}` : ''), `Завершённые книги и новинки, ${freeFirst}`)
    kicker = P || (kind === 'tropes' ? 'Сюжет' : 'Жанр')
  } else {
    h1 = doc.h1 || `${T}: книги и аудиокниги`
    title = kind === 'genres'
      ? fit(T, [' — читать книги и слушать аудиокниги онлайн', ' — читать книги и слушать аудиокниги', ': книги и аудиокниги онлайн', ': книги и аудиокниги'].map((t) => t + plus18))
      : fit(T, TROPE_TAILS.map((t) => t + plus18))
    description = sentences(`${T}${counts ? ` — ${counts}` : ': книги и аудиокниги'}`, lead, `Лучшие, завершённые и новинки, серии по порядку, ${freeFirst}`)
    kicker = kind === 'tropes' ? 'Сюжет' : 'Жанр'
  }

  return {
    title: brand(title),
    description: clip(description),
    h1,
    kicker,
    h2: {
      list: kind === 'collections' ? (audio ? `Все аудиокниги подборки ${q(T)}` : `Все книги подборки ${q(T)}`) : audio ? `Аудиокниги ${q(P || T)}` : isFamily ? `Популярные книги: ${low(T)}` : `Лучшие книги ${q(topic)}`,
      audio: `Аудиокниги ${q(topic)}: слушать онлайн`,
      series: kind === 'collections' ? 'Серии по порядку' : `Серии ${q(topic)} по порядку`,
      children: parent && P ? `Ещё по сюжету ${q(P)}` : `Уточните сюжет: ${low(T)}`,
      tiles: `Сюжеты: ${low(T)}`,
      faq: `Вопросы и ответы: ${low(topic)}`,
      related: kind === 'genres' ? 'Сюжеты жанра' : 'Похожие сюжеты',
    },
  }
}

