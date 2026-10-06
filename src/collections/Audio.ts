import type { CollectionConfig } from 'payload'
import { anyone, staffOnly } from '../access'

/**
 * Аудиофайлы глав. MVP: прямые файлы (mp3/m4a) в S3. Во второй итерации —
 * подписанные ссылки для платных глав, чтобы файл нельзя было скачать
 * без подписки.
 */
export const Audio: CollectionConfig = {
  slug: 'audio',
  labels: { singular: 'Аудиофайл', plural: 'Аудиофайлы' },
  admin: { group: 'Файлы' },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: staffOnly },
  upload: { mimeTypes: ['audio/*'] },
  fields: [
    { name: 'title', type: 'text', label: 'Название' },
    { name: 'durationSec', type: 'number', label: 'Длительность, сек' },
  ],
}
