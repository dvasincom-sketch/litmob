import React from 'react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { Wrap } from './Wrap'

/** Винная шапка страницы (как у сюжета и книги в макете). */
export function PageHero({ crumbs, title, lead, children }: { crumbs?: Crumb[]; title: string; lead?: string | null; children?: React.ReactNode }) {
  return (
    <header className="on-dark bg-wine text-white">
      <Wrap className="flex flex-col gap-3.5 pb-6 pt-3.5 lg:pb-10 lg:pt-6">
        {crumbs && <Breadcrumbs items={crumbs} light />}
        <h1 className="max-w-4xl text-[28px] lg:text-[44px]">{title}</h1>
        {lead && <p className="max-w-3xl text-sm text-blush lg:text-base">{lead}</p>}
        {children}
      </Wrap>
    </header>
  )
}
