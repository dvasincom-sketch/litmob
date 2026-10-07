# Бриф: тексты для страниц сюжетов, семейств и жанров litmob.ru

## Что за сайт
Литмоб (litmob.ru) — книги и аудиокниги по сюжетам (тропам): ромфант, любовное фэнтези, попаданки,
бытовое фэнтези, академии; есть мужской блок (попаданцы, ЛитРПГ, боярка). Первая глава в аудио —
бесплатно, дальше подписка; текст книги читатель находит у автора на его площадке (Литнет, Author.Today
и т. п.) — у нас ссылка «Читать текст у автора». Литмобы — серии книг разных авторов на один сюжет
по общим правилам (/litmoby/).

Ядро аудитории: женщины 25–45, читают и слушают ромфант запоем, по дороге и за домашними делами,
хорошо знают тропы и сленг жанра (истинная, проды, ХЭ, слоуберн, попаданка, адептка, отбор).
Мужской блок: мужчины 20–45, ЛитРПГ/попаданцы/боярка, длинные циклы.

## Голос
Тёплый, живой, уверенный, как у подруги-книжницы, которая прочитала всё. Коротко и по делу.
Можно лёгкую иронию. Никакого канцелярита и рекламных штампов.
Запрещено: «в этой статье», «давайте разберёмся», «погрузитесь в мир», «захватывающий», «уникальный»,
«не оставит равнодушным», «окунуться», «идеально подойдёт», цепочки восклицаний, эмодзи,
слова «честно», «искренне». Не обращаться к читателю «дорогие читательницы».

## Факты
- НЕ называть конкретные книги, авторов, чтецов, цифры спроса и количество книг в каталоге.
- НЕ обещать «бесплатно читать полностью». Можно: «первая глава в аудио бесплатно», «ссылка на текст у автора».
- Описывать сюжет, его типичные ходы, героиню и героя, тон (драма / юмор / уют), чем он отличается
  от соседних сюжетов, кому понравится, с чего начать (завершённые книги, серии по порядку, аудио).
- 18+ (омегаверс): без откровенных сцен в тексте, только гетеро-пары «героиня-омега и герой-альфа»,
  упомянуть, что раздел для взрослых.

## Формат и объём
Один файл на страницу: `content/landing/<имя>.md`, где имя — путь страницы через `__`
(например `tropy__razvod-s-drakonom.md`, `zhanr__bytovoe-fentezi.md`, `18__omegavers.md`, `audio__rasskazy.md`).

```
---
collection: tropes        # tropes — сюжеты и семейства; genres — жанры (и /audio/rasskazy/)
path: /tropy/razvod-s-drakonom/
---
Текст...

## Частые вопросы

### Вопрос?
Ответ в 1–2 предложения.
```

- Текст до блока FAQ: **1100–1600 знаков с пробелами** (сюжет), **1300–1800** (семейство и жанр).
- 2 подзаголовка `##` внутри текста, разные по формулировке на разных страницах (не шаблон
  «О чём сюжет» везде). В подзаголовке естественно звучит тема страницы.
  Не повторять H1 страницы. Не использовать `#`, `###` вне FAQ, таблицы, картинки.
- Главный запрос страницы (поле `q` в structure.ts) — 1–2 раза дословно или в близкой форме,
  плюс 2–3 естественных вариации (книги про…, читать, слушать аудиокнигу, лучшие, завершённые,
  по порядку). Без переспама.
- **2–4 внутренние ссылки** markdown-формата `[текст](/путь/)` строго из списка ниже: соседние сюжеты
  (поле `related`), уточнения сюжета (`refs`: путь = путь сюжета + slug уточнения + `/`), аудиоподстраница
  (`…/audio/`, только если она есть в списке), жанр, литмоб. Анкор — живые слова, не «здесь».
- FAQ: 2–3 вопроса, которые реально ищут («что такое …», «с чего начать», «есть ли аудиокниги»,
  «чем отличается … от …», «есть ли ХЭ»). Не дублировать уже существующие вопросы (см. structure.ts:
  у некоторых сюжетов поле `faq`).
- Жирный текст — максимум 1–2 раза за текст или не использовать.

## Данные
Все сюжеты, семейства, жанры, их `q`, `lead`, `sub`, `related`, `refs` — в файле
`/home/claude/lm/src/seed/structure.ts` (FAMILIES, GENRES). Пути:
- семейство: `/tropy/<slug семейства>/`
- сюжет: `/tropy/<slug>/` (кроме омегаверса: `/18/omegavers/`)
- уточнение: `/tropy/<slug сюжета>/<slug уточнения>/`
- жанр: `/zhanr/<slug>/`, у «Аудиорассказов» — `/audio/rasskazy/`

## Разрешённые адреса для ссылок
/tropy/ /zhanr/ /podborki/ /chtecy/ /litmoby/ /litmoby/pravila/ /serii/
/tropy/brak-i-razvod/ /tropy/razvod-s-drakonom/ /tropy/razvod-s-drakonom/audio/ /tropy/razvod-s-drakonom/s-generalom/ /tropy/razvod-s-drakonom/popadanka/ /tropy/razvod-s-drakonom/posle-razvoda/ /tropy/razvod-s-drakonom/istinnaya/
/tropy/zhena-generala-drakona/ /tropy/zhena-generala-drakona/audio/ /tropy/zhena-generala-drakona/byvshaya/
/tropy/nelyubimaya-zhena/ /tropy/nelyubimaya-zhena/vtoraya/ /tropy/nelyubimaya-zhena/otvergnutaya/
/tropy/vdova/ /tropy/vdova/pomestye/ /tropy/naslednik/ /tropy/naslednik/beremenna/ /tropy/izmena/ /tropy/vtoroj-shans/ /tropy/vtoroj-shans/mest/ /tropy/fiktivnyj-brak/ /tropy/byvshie/
/tropy/istinnaya-i-oborotni/ /tropy/istinnaya-para/ /tropy/istinnaya-para/audio/ /tropy/istinnaya-para/bez-drakona/ /tropy/istinnaya-para/nenuzhnaya/
/tropy/otvergnutaya-para/ /tropy/otvergnutaya-para/alfa/ /tropy/otvergnutaya-para/istinnaya/ /tropy/oborotni/ /tropy/oborotni/alfa/ /tropy/vampiry/ /tropy/fejri/ /tropy/demony/
/18/omegavers/ /18/omegavers/omega-dlya-alfy/ /18/omegavers/audio/
/tropy/nevesty-i-akademii/ /tropy/akademiya-drakonov/ /tropy/akademiya-drakonov/rektor/ /tropy/sluzhanka-rektora/ /tropy/adeptka/ /tropy/nevesta-drakona/ /tropy/otbor-nevest/
/tropy/popadanka-v-novom-mire/ /tropy/popadanka-v-zlodejku/ /tropy/popadanka-k-drakonu/ /tropy/popadanka-v-knigu/ /tropy/popadanka-v-akademiyu/
/tropy/svoe-delo/ /tropy/hozyajka-lavki/ /tropy/hozyajka-pomestya/ /tropy/hozyajka-pomestya/zabroshennoe/ /tropy/hozyajka-taverny/
/tropy/geroi/ /tropy/ot-nenavisti-do-lyubvi/ /tropy/ot-nenavisti-do-lyubvi/slouburn/ /tropy/gercog/ /tropy/gercog/temnyj/ /tropy/boss/ /tropy/raznica-v-vozraste/
/tropy/muzhskie-syuzhety/ /tropy/regressor/ /tropy/nekromant/ /tropy/lekar/ /tropy/lekar/celitel/ /tropy/apokalipsis/
/zhanr/lyubovnoe-fentezi/ /zhanr/lyubovnoe-fentezi/audio/ /zhanr/bytovoe-fentezi/ /zhanr/bytovoe-fentezi/audio/ /zhanr/popadanka/ /zhanr/popadanka/audio/ /zhanr/lyubovnye-romany/ /zhanr/lyubovnye-romany/audio/ /zhanr/dark-romans/ /zhanr/akademiya-magii/ /zhanr/popadancy/ /zhanr/popadancy/audio/ /zhanr/popadancy/v-proshloe/ /zhanr/popadancy/v-sssr/ /zhanr/popadancy/rossijskaya-imperiya/ /zhanr/litrpg/ /zhanr/litrpg/popadancy/ /zhanr/boyarka/ /zhanr/detektivy/ /zhanr/detektivy/audio/ /audio/rasskazy/
/podborki/knigi-s-drakonami/ /podborki/audio-romfant-mesyaca/ /podborki/novinki-romfanta/ /podborki/kultivaciya/ /podborki/luchshie-trillery/ /podborki/fantastika/ /podborki/chastnyj-detektiv/ /podborki/sagi-o-vampirah/ /pohozhie/
/litmoby/razvod-s-drakonom/
/zhanr/fentezi/ /zhanr/fentezi/audio/ /zhanr/fentezi/yumoristicheskoe/ /zhanr/fentezi/temnoe/ /zhanr/fentezi/boevoe/
/zhanr/fantastika/ /zhanr/fantastika/audio/ /zhanr/fantastika/boevaya/ /zhanr/fantastika/kosmicheskaya/ /zhanr/fantastika/postapokalipsis/ /zhanr/fantastika/antiutopiya/
/zhanr/istoricheskij-lyubovnyj-roman/ /zhanr/young-adult/ /18/garemnik/
/tropy/vedmy/ /tropy/elfy/ /audio/
/litmoby/kalendar/ /litmoby/temy/razvod/ /litmoby/temy/popadanka/ /litmoby/temy/drakony/ /litmoby/temy/muzhya-iz-kosmosa/ /litmoby/temy/naslednica/ /litmoby/temy/byvshie/ /litmoby/temy/izmena/ /litmoby/sozdat/
/zarubezhnye/romantazija/ /zarubezhnye/bridzhertony/ /avtoram/kak-napisat-knigu/ /avtoram/gde-opublikovat-knigu/ /avtoram/literaturnye-konkursy/ /avtoram/chto-takoe-syuzhet/ /avtoram/personazh/ /avtoram/kak-prodat-knigu/ /avtoram/oblozhka-dlya-knigi/ /slovar-romfanta/ /sravnenie/litnet-author-today-litres/ /ozvuchka-knig/ /ozvuchka-ii-ili-chtec/ /chtecam/ /podpiska/ /o-proekte/
