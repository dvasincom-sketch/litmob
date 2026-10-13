/**
 * Правило сайта: на сторонние площадки (Литнет, Author.Today, ЛитРес и т. п.) ссылками
 * пользователя не отправляем. Название площадки упомянуть в тексте можно, ссылку — нет.
 * Внешние ссылки в данных (externalLinks, links у авторов, ссылки в текстах) остаются
 * для редакции, но на страницах выводятся только текстом.
 */
const OWN_HOSTS = new Set(['litmob.ru', 'www.litmob.ru'])

/** Своя ссылка: относительный путь, якорь или адрес на litmob.ru. */
export function isOwnUrl(url?: string | null) {
  if (!url) return false
  const u = url.trim()
  if (u.startsWith('/') || u.startsWith('#') || u.startsWith('?')) return !u.startsWith('//')
  try {
    return OWN_HOSTS.has(new URL(u).hostname.toLowerCase())
  } catch {
    return false
  }
}

/** Названия площадок без ссылок: «ЛитРес, Литнет». */
export const platformNames = (links?: { label?: string | null }[] | null) =>
  [...new Set((links || []).map((l) => (l?.label || '').trim()).filter(Boolean))].join(', ')
