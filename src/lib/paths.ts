/**
 * Единые правила адресов. Один источник правды для фронта, sitemap и хуков,
 * которые вычисляют и сохраняют поле `path` у каждой SEO-страницы.
 */
export const ADULT_PREFIX = '/18'

export const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, '')

/** '/tropy/razvod-s-drakonom/audio/' — всегда со слешами по краям. */
export const joinPath = (...parts: (string | null | undefined)[]) => {
  const clean = parts.filter(Boolean).map((p) => trimSlashes(String(p))).filter(Boolean)
  return `/${clean.join('/')}/`
}

/** Транслитерация для slug (ГОСТ-подобная, как в URL структуры сайта). */
const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'j',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .split('')
    .map((ch) => (ch in MAP ? MAP[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
