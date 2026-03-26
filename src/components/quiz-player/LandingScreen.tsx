'use client'

import type { QuizSettings } from '@/lib/sanitize'

interface Props {
  title: string
  settings: QuizSettings
  onStart: () => void
}

export function LandingScreen({ title, settings: s, onStart }: Props) {
  const checklistItems = [s.checklist_item_1, s.checklist_item_2, s.checklist_item_3].filter(Boolean)

  return (
    <div className="rounded-xl bg-white p-8 text-center">
      {s.landing_image && (
        <img
          src={s.landing_image}
          alt=""
          loading="lazy"
          className="mx-auto mb-6 block h-auto max-h-80 w-full max-w-[708px] rounded-xl object-cover"
        />
      )}
      {s.badge_text && (
        <div className="mb-4 inline-block rounded-full bg-[#f1f7ee] px-4 py-1.5 text-[0.85em] font-bold uppercase tracking-wide text-[#426a35]">
          {s.badge_text}
        </div>
      )}
      {s.headline ? (
        <h2
          className="mb-3 text-[1.6em] font-bold leading-tight text-gray-900"
          dangerouslySetInnerHTML={{ __html: s.headline }}
        />
      ) : (
        <h2 className="mb-3 text-[1.6em] font-bold text-gray-900">{title}</h2>
      )}
      {s.subheadline && (
        <div
          className="mb-6 text-[1.05em] leading-relaxed text-gray-600"
          dangerouslySetInnerHTML={{ __html: s.subheadline }}
        />
      )}
      {checklistItems.length > 0 && (
        <div className="mx-auto mb-6 inline-block max-w-[420px] text-left">
          {checklistItems.map((item, i) => (
            <div key={i} className="mb-2.5 flex items-center gap-2.5 text-[0.95em] text-gray-600">
              <span className="text-[1.2em] text-[#426a35]">✅</span>
              <span>{String(item).replace(/^[✔✅\s]+/, '')}</span>
            </div>
          ))}
        </div>
      )}
      {s.urgency_text && (
        <p className="mx-auto mb-6 max-w-[500px] rounded-lg bg-red-50 p-3 text-[0.95em] font-semibold text-red-600">
          {s.urgency_text}
        </p>
      )}
      <button
        onClick={onStart}
        className="mx-auto block w-full max-w-[400px] rounded-xl bg-[#426a35] px-12 py-[18px] text-[1.15em] font-bold text-white shadow-[0_4px_12px_rgba(66,106,53,0.3)] transition-transform hover:scale-[1.02]"
      >
        {s.cta_button || 'Iniciar Quiz'}
      </button>
    </div>
  )
}
