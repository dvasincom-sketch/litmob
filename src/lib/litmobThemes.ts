/**
 * Темы литмобов, которые ищут («литмоб развод», «литмоб попаданка», «литмоб драконы» …).
 * Страница темы — /litmoby/temy/<slug>/ (документ в «Страницах»), литмобы подбираются по сюжетам.
 */
export const LITMOB_THEMES: Record<string, { title: string; tropes: string[]; createTrope?: string }> = {
  razvod: { title: 'Развод', tropes: ['razvod-s-drakonom', 'izmena', 'nelyubimaya-zhena', 'zhena-generala-drakona'], createTrope: 'razvod-s-drakonom' },
  popadanka: { title: 'Попаданка', tropes: ['popadanka-v-zlodejku', 'popadanka-k-drakonu', 'popadanka-v-knigu', 'popadanka-v-akademiyu'], createTrope: 'popadanka-k-drakonu' },
  drakony: { title: 'Драконы', tropes: ['razvod-s-drakonom', 'zhena-generala-drakona', 'istinnaya-para', 'akademiya-drakonov', 'nevesta-drakona', 'sluzhanka-rektora'], createTrope: 'istinnaya-para' },
  'muzhya-iz-kosmosa': { title: 'Мужья из космоса', tropes: [] },
  naslednica: { title: 'Наследница', tropes: ['naslednik', 'hozyajka-pomestya', 'vdova'], createTrope: 'hozyajka-pomestya' },
  byvshie: { title: 'Бывшие', tropes: ['byvshie', 'vtoroj-shans'], createTrope: 'byvshie' },
  izmena: { title: 'Измена', tropes: ['izmena', 'razvod-s-drakonom'], createTrope: 'izmena' },
}

export const LITMOB_STATUS: Record<string, string> = { recruiting: 'Набор авторов', running: 'Идёт', voting: 'Голосование', finished: 'Завершён' }
