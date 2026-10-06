import type { Metadata } from 'next'
import { staticMetadata } from '@/lib/seo'
import { Wrap } from '@/components/Wrap'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = staticMetadata(
  '/pravoobladatelyam/',
  'Правообладателям и авторам: подтвердить или удалить страницу | Литмоб',
  'Как автору или правообладателю подтвердить страницу книги на Литмобе, добавить ссылки и озвучку или удалить страницу.',
)

export default function Rights() {
  return (
    <Wrap className="prose-lm flex flex-col gap-2  py-6 md:py-10">
      <Breadcrumbs items={[{ label: 'Правообладателям', href: '/pravoobladatelyam/' }]} />
      <h1 className="text-3xl">Правообладателям и авторам</h1>
      <p>Справочные страницы книг содержат только наше описание и ссылки на площадку автора — без текста книги, обложек и аудио.</p>
      <h2>Подтвердить страницу</h2>
      <p>Если вы автор — напишите на <a href="mailto:rights@litmob.ru">rights@litmob.ru</a> со ссылкой на страницу и на ваш профиль на площадке. После проверки добавим обложку, главы и озвучку по договору.</p>
      <h2>Удалить страницу</h2>
      <p>Пришлите ссылку на страницу и подтверждение прав на тот же адрес. Отвечаем в течение 3 рабочих дней.</p>
    </Wrap>
  )
}
