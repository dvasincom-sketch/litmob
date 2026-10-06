import { JsonLd } from './JsonLd'

export function Faq({ items }: { items?: { q: string; a: string; id?: string | null }[] | null }) {
  if (!items?.length) return null
  return (
    <section className="mt-8">
      <h2 className="mb-3.5 text-xl md:text-2xl">Вопросы о сюжете</h2>
      <div className="flex flex-col gap-2.5">
        {items.map((f) => (
          <details key={f.id || f.q} className="rounded-xl border border-line bg-white px-3.5 py-3">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 text-sm text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
    </section>
  )
}
