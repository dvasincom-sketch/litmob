import { FAMILIES } from '@/seed/structure'

/**
 * Обложки-заглушки: у каждого семейства сюжетов своя фактура и палитра,
 * у книги — свой оттенок внутри палитры (по id). Пока нет настоящей обложки,
 * лента книг выглядит разнообразно, а сюжет считывается с первого взгляда.
 */
export type Motif = 'scales' | 'moon' | 'arches' | 'portal' | 'flowers' | 'crown' | 'runes'

const FAMILY_MOTIF: Record<string, Motif> = {
  'brak-i-razvod': 'scales',
  'istinnaya-i-oborotni': 'moon',
  'nevesty-i-akademii': 'arches',
  'popadanka-v-novom-mire': 'portal',
  'svoe-delo': 'flowers',
  geroi: 'crown',
  'muzhskie-syuzhety': 'runes',
}

/** [фон сверху, фон снизу, узор, текст] */
const PALETTES: Record<Motif, [string, string, string, string][]> = {
  scales: [['#7A1F3D', '#3A1424', '#F2A7C3', '#FFF4F7'], ['#B23A5E', '#5A1A30', '#FFD3E0', '#FFFFFF'], ['#E9C7D2', '#C98BA0', '#7A1F3D', '#3A1424']],
  moon: [['#2E2350', '#120E26', '#C9B8FF', '#F3EEFF'], ['#4B3A7A', '#1E1638', '#F2A7C3', '#FFFFFF'], ['#DCCBE6', '#A98FC2', '#2E2350', '#20183A']],
  arches: [['#5B2A6E', '#2A1236', '#E8C98A', '#FFF7E8'], ['#8A4A6E', '#3E1A35', '#F5D9A8', '#FFFFFF'], ['#F0E1D2', '#D5B79A', '#5B2A6E', '#3A1830']],
  portal: [['#0F5E5A', '#082F33', '#9BE0D3', '#ECFFFB'], ['#2C6E8F', '#123246', '#F2A7C3', '#FFFFFF'], ['#CFE8E3', '#93C4BC', '#0F5E5A', '#0B3A37']],
  flowers: [['#F2D9C4', '#E3B595', '#9C2B4E', '#5A2416'], ['#E7EBD3', '#BFC99A', '#7A4A2A', '#3F3A1C'], ['#F6DCDC', '#E5AFAF', '#7A1F3D', '#4A1A24']],
  crown: [['#3A1424', '#1A0910', '#D9B26A', '#FFF3DD'], ['#6E1830', '#2E0A16', '#E8C98A', '#FFFFFF'], ['#E8D3C9', '#C9A28F', '#3A1424', '#2A1219']],
  runes: [['#24456B', '#0E1C2E', '#8FB3D9', '#EAF2FC'], ['#3A3F4A', '#16181D', '#C9CDD5', '#FFFFFF'], ['#5C6B3A', '#262D16', '#D4DFA8', '#F6FAE8']],
}

const TROPE_MOTIF = new Map<string, Motif>()
for (const f of FAMILIES) for (const t of f.tropes) TROPE_MOTIF.set(t.slug, FAMILY_MOTIF[f.slug])

export function coverStyle(tropeSlug: string | undefined, id: number) {
  const motif: Motif = (tropeSlug && TROPE_MOTIF.get(tropeSlug)) || 'flowers'
  const pal = PALETTES[motif]
  const [top, bottom, pattern, text] = pal[id % pal.length]
  return { motif, top, bottom, pattern, text }
}
