import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const mediaHost = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).hostname : undefined

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    remotePatterns: mediaHost ? [{ protocol: 'https', hostname: mediaHost, pathname: '/**' }] : [],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
