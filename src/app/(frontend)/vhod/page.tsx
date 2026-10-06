import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/LoginForm'
import { Wrap } from '@/components/Wrap'

export const metadata: Metadata = { title: 'Вход | Литмоб', robots: { index: false, follow: false } }

export default function Login() {
  return (
    <Wrap className="flex justify-center py-8 md:py-14">
      <Suspense>
        <LoginForm />
      </Suspense>
    </Wrap>
  )
}
