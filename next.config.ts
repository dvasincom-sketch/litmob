import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const mediaHost = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).hostname : undefined

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    // Timeweb S3 разрешён всегда — тогда S3_PUBLIC_URL не обязан быть известен на этапе сборки.
    remotePatterns: [
      { protocol: 'https', hostname: 's3.twcstorage.ru', pathname: '/**' },
      { protocol: 'https', hostname: '*.s3.twcstorage.ru', pathname: '/**' },
      ...(mediaHost ? [{ protocol: 'https' as const, hostname: mediaHost, pathname: '/**' }] : []),
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
