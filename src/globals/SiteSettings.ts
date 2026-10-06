import type { GlobalConfig } from 'payload'
import { staffOnly } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  access: { read: () => true, update: staffOnly },
  fields: [
    { name: 'siteName', type: 'text', label: 'Название', defaultValue: 'Литмоб' },
    { name: 'tagline', type: 'text', label: 'Подзаголовок', defaultValue: 'Книги и аудиокниги по любимому сюжету' },
    { name: 'adultGateText', type: 'textarea', label: 'Текст возрастного окна', defaultValue: 'Раздел содержит откровенные сцены. Вам есть 18 лет?' },
    { name: 'minBooksToIndex', type: 'number', label: 'Книг для индексации страницы', defaultValue: 5, admin: { description: 'Страница сюжета с меньшим числом книг закрыта от поиска (noindex).' } },
  ],
}
