import React from 'react'

/** Контейнер страницы: 16px поля на мобильном, 1240px на десктопе (как в макете Main). */
export function Wrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-4 md:px-6 ${className}`}>{children}</div>
}

/** Заголовок секции: Prata 22px + ссылка «Все» справа. */
export function SectionHead({ title, href, more = 'Все', lead }: { title: string; href?: string; more?: string; lead?: string }) {
  return (
    <div className="mb-3.5 flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[22px] md:text-[28px]">{title}</h2>
        {href && (
          <a href={href} className="flex-none text-sm font-semibold text-rose">
            {more}
          </a>
        )}
      </div>
      {lead && <p className="max-w-[70ch] text-muted">{lead}</p>}
    </div>
  )
}
