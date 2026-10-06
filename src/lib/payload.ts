import config from '@payload-config'
import { getPayload } from 'payload'

export const getPayloadClient = async () => getPayload({ config })

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
