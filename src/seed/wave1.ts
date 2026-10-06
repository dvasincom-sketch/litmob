/**
 * Волна 1 из «Структуры сайта»: хабы семейств и самые быстрорастущие сюжеты.
 * Цифры спроса — Wordstat, Россия, октябрь 2025 — сентябрь 2026.
 * Тексты — черновики в голосе площадки; редактор дописывает в админке.
 */
export type SeedTrope = {
  key: string
  title: string
  slug: string
  kind: 'family' | 'trope' | 'refinement'
  family?: string[]
  parent?: string
  audioOnly?: boolean
  adult?: boolean
  h1?: string
  lead: string
  mainQuery: string
  monthlyVolume?: number
  growth?: string
  wave: '1' | '2' | '3' | '4'
  phrases?: string
  faq?: { q: string; a: string }[]
  related?: string[]
}

export const FAMILIES: SeedTrope[] = [
  {
    key: 'brak',
    title: 'Развод, брак и второй шанс',
    slug: 'brak-i-razvod',
    kind: 'family',
    h1: 'Развод, брак и второй шанс: любовное фэнтези',
    lead: 'Героиня уходит от мужа-дракона, становится нелюбимой женой или вдовой — и строит жизнь заново. Самое быстрорастущее семейство сюжетов: за год интерес вырос в 2,5–3,4 раза.',
    mainQuery: 'развод с драконом',
    wave: '1',
  },
  {
    key: 'istinnaya',
    title: 'Истинная пара и оборотни',
    slug: 'istinnaya-i-oborotni',
    kind: 'family',
    h1: 'Истинная пара и оборотни: книги и аудиокниги',
    lead: 'Истинная дракона, отвергнутая пара, альфа и его волчица. Здесь собраны сюжеты, где судьба решает раньше героев — а героиня всё равно делает по-своему.',
    mainQuery: 'истинная дракона',
    wave: '1',
  },
  {
    key: 'akademii',
    title: 'Невесты и академии',
    slug: 'nevesty-i-akademii',
    kind: 'family',
    h1: 'Невесты и академии магии',
    lead: 'Академия драконов, строгий ректор, отбор невест. Сюжеты, где учёба и любовь идут рука об руку.',
    mainQuery: 'академия драконов',
    wave: '1',
  },
]

export const TROPES: SeedTrope[] = [
  {
    key: 'razvod',
    title: 'Развод с драконом',
    slug: 'razvod-s-drakonom',
    kind: 'trope',
    family: ['brak'],
    h1: 'Развод с драконом: книги и аудиокниги',
    lead: 'Героиня уходит от мужа-дракона и начинает жизнь заново: своё дело, новая любовь, а бывший осознаёт ошибку слишком поздно.',
    mainQuery: 'развод с драконом',
    monthlyVolume: 79200,
    growth: '×2,4',
    wave: '1',
    phrases: 'развод с драконом читать, развод по-драконьи, развод с драконом книги, развод с драконом слушать',
    faq: [
      { q: 'Что такое сюжет «развод с драконом»?', a: 'Поджанр любовного фэнтези: героиня разводится с мужем-драконом, часто генералом или аристократом, и строит новую жизнь. Обычно — со своим делом, ребёнком и второй любовью.' },
      { q: 'С чего начать?', a: 'С завершённой книги из топа: её можно прочитать или послушать целиком без ожидания проды.' },
      { q: 'Где прочитать текст?', a: 'На странице книги есть ссылка на площадку автора, где выложен текст. Аудио с первой главой бесплатно — у нас.' },
    ],
    related: ['zhena', 'nelyubimaya', 'istinnaya-para'],
  },
  {
    key: 'zhena',
    title: 'Жена генерала-дракона',
    slug: 'zhena-generala-drakona',
    kind: 'trope',
    family: ['brak'],
    h1: 'Жена генерала-дракона: книги и аудиокниги',
    lead: 'Генерал вернулся с войны — с другой женщиной, с холодом или с тайной. Героиня не плачет, а действует.',
    mainQuery: 'жена генерала дракона',
    monthlyVolume: 24100,
    growth: '×3,4',
    wave: '1',
    related: ['razvod', 'nelyubimaya'],
  },
  {
    key: 'nelyubimaya',
    title: 'Нелюбимая и ненужная жена',
    slug: 'nelyubimaya-zhena',
    kind: 'trope',
    family: ['brak'],
    h1: 'Нелюбимая жена дракона: книги и аудиокниги',
    lead: 'Её выдали замуж по расчёту и забыли в дальнем поместье. Но ненужная жена оказывается сильнее, чем думали все — включая мужа.',
    mainQuery: 'ненужная жена',
    monthlyVolume: 31500,
    growth: '×1,5',
    wave: '1',
    phrases: 'нелюбимая жена дракона, ненужная жена дракона, нелюбимая жена генерала',
    related: ['razvod', 'zhena'],
  },
  {
    key: 'istinnaya-para',
    title: 'Истинная пара',
    slug: 'istinnaya-para',
    kind: 'trope',
    family: ['istinnaya'],
    h1: 'Истинная пара: книги про истинную дракона',
    lead: 'Метка, зов и связь, которую нельзя разорвать. Истинная дракона — один из самых любимых сюжетов любовного фэнтези.',
    mainQuery: 'истинная дракона',
    monthlyVolume: 47500,
    growth: '×1,2',
    wave: '1',
    related: ['otvergnutaya', 'razvod'],
  },
  {
    key: 'otvergnutaya',
    title: 'Отвергнутая пара',
    slug: 'otvergnutaya-para',
    kind: 'trope',
    family: ['istinnaya'],
    h1: 'Отвергнутая пара: книги про отвергнутую истинную',
    lead: 'Альфа отказался от своей пары — и пожалеет. Самый быстрорастущий сюжет года: интерес вырос почти в 12 раз.',
    mainQuery: 'отвергнутая пара',
    monthlyVolume: 3000,
    growth: '×11,6',
    wave: '1',
    phrases: 'отвергнутая альфой, отвергнутая пара читать, отвергнутая истинная',
    related: ['istinnaya-para'],
  },
  {
    key: 'akademiya-drakonov',
    title: 'Академия драконов',
    slug: 'akademiya-drakonov',
    kind: 'trope',
    family: ['akademii'],
    h1: 'Академия драконов: книги и аудиокниги',
    lead: 'Адептка без сильного дара, ректор-дракон и академия, где правила пишут сильные. Классика романтического фэнтези в новом прочтении.',
    mainQuery: 'академия драконов',
    monthlyVolume: 55300,
    growth: '×1,1',
    wave: '1',
    related: ['sluzhanka'],
  },
  {
    key: 'sluzhanka',
    title: 'Служанка ректора',
    slug: 'sluzhanka-rektora',
    kind: 'trope',
    family: ['akademii'],
    h1: 'Служанка ректора: книги и аудиокниги',
    lead: 'Она пришла в академию служанкой, а не адепткой. Ректор-дракон заметил её раньше, чем она хотела.',
    mainQuery: 'служанка ректора',
    monthlyVolume: 9600,
    growth: '×14',
    wave: '1',
    related: ['akademiya-drakonov'],
  },
  {
    key: 'zlodejka',
    title: 'Попаданка в злодейку',
    slug: 'popadanka-v-zlodejku',
    kind: 'trope',
    h1: 'Попаданка в злодейку: книги и аудиокниги',
    lead: 'Очнулась в теле злодейки из романа, которой суждено плохо кончить. Значит, сюжет придётся переписать.',
    mainQuery: 'попаданка в злодейку',
    monthlyVolume: 5200,
    growth: '×1,4',
    wave: '1',
  },
  {
    key: 'lavka',
    title: 'Хозяйка лавки',
    slug: 'hozyajka-lavki',
    kind: 'trope',
    h1: 'Хозяйка лавки: бытовое фэнтези',
    lead: 'Своя лавка зелий, пряников или артефактов, хитрые соседи и дракон, который зашёл «просто за покупкой». Уютное бытовое фэнтези.',
    mainQuery: 'хозяйка лавки',
    monthlyVolume: 17500,
    growth: '×1,5',
    wave: '1',
  },
]

export const REFINEMENTS: SeedTrope[] = [
  {
    key: 'razvod-audio',
    title: 'Аудиокниги',
    slug: 'audio',
    kind: 'refinement',
    parent: 'razvod',
    audioOnly: true,
    h1: 'Развод с драконом: аудиокниги',
    lead: 'Аудиокниги про развод с драконом в исполнении профессиональных чтецов. Первая глава бесплатно.',
    mainQuery: 'аудиокнига развод с драконом',
    monthlyVolume: 5100,
    growth: '×3,2',
    wave: '1',
  },
  {
    key: 'istinnaya-audio',
    title: 'Аудиокниги',
    slug: 'audio',
    kind: 'refinement',
    parent: 'istinnaya-para',
    audioOnly: true,
    h1: 'Истинная дракона: аудиокниги',
    lead: 'Слушайте истории про истинную пару: первая глава бесплатно, дальше по подписке.',
    mainQuery: 'истинная дракона аудиокнига',
    monthlyVolume: 4100,
    growth: '×1,1',
    wave: '1',
  },
  {
    key: 'otvergnutaya-alfa',
    title: 'Отвергнутая альфой',
    slug: 'alfa',
    kind: 'refinement',
    parent: 'otvergnutaya',
    h1: 'Отвергнутая альфой: книги про оборотней',
    lead: 'Альфа стаи отверг истинную на глазах у всех. Посмотрели сериал? Здесь — книги и аудиокниги с тем же сюжетом.',
    mainQuery: 'отвергнутая альфой',
    monthlyVolume: 7500,
    growth: '×11,9',
    wave: '1',
  },
  {
    key: 'rektor',
    title: 'Ректор-дракон',
    slug: 'rektor',
    kind: 'refinement',
    parent: 'akademiya-drakonov',
    h1: 'Ректор-дракон: книги про академию драконов',
    lead: 'Строгий, древний, невыносимый — и только она видит его другим.',
    mainQuery: 'ректор дракон',
    monthlyVolume: 15600,
    growth: '×2,1',
    wave: '1',
  },
]

export const GENRES = [
  {
    key: 'bytovoe',
    title: 'Бытовое фэнтези',
    slug: 'bytovoe-fentezi',
    h1: 'Бытовое фэнтези: книги и аудиокниги',
    lead: 'Уют, своё дело и магия в мелочах: лавки, поместья, таверны и попаданки, которые наводят порядок в новом мире.',
    mainQuery: 'бытовое фэнтези',
    monthlyVolume: 74300,
    growth: '×1,1',
    wave: '1' as const,
    tropes: ['lavka'],
  },
  {
    key: 'bytovoe-audio',
    title: 'Аудиокниги',
    slug: 'audio',
    parent: 'bytovoe',
    audioOnly: true,
    h1: 'Бытовое фэнтези: аудиокниги',
    lead: 'Слушать бытовое фэнтези: первая глава бесплатно, профессиональные чтецы.',
    mainQuery: 'слушать бытовое фэнтези',
    monthlyVolume: 20750,
    growth: '×3,4',
    wave: '1' as const,
  },
]
