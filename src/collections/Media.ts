import type { CollectionConfig } from 'payload'
import { anyone, staffOnly } from '../access'

/** Картинки: обложки, аватары, фото чтецов. Хранятся в S3 (Timeweb), если задан S3_BUCKET. */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Изображение', plural: 'Изображения' },
  admin: { group: 'Файлы' },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: staffOnly },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'cover', width: 600, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'thumb', width: 240, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
  },
  fields: [{ name: 'alt', type: 'text', label: 'Alt-текст' }],
}
