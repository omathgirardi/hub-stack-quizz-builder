'use client'

import type { QuizSettings, BandSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  band: string
  bandData: BandSettings | null
  score: number
  quizId: string
}

const copyBands: Record<string, Record<string, { headline: string; description: string }>> = {
  es: {
    leve: { headline: 'Tu cuerpo presenta señales iniciales de inflamación', description: 'Este es el momento ideal para actuar e prevenir el avance.' },
    moderada: { headline: 'Tu cuerpo presenta inflamación moderada', description: 'Los síntomas ya afectan tu qualidade de vida.' },
    moderada_avancada: { headline: 'Tu cuerpo presenta señales de inflamación moderada a avanzada', description: 'Es crucial actuar ahora para evitar daños irreversíveis.' },
    avancada: { headline: 'Tu cuerpo apresenta señales de inflamación avanzada', description: 'Atención urgente: tu cuerpo necesita un protocolo específico ahora.' },
  },
  pt: {
    leve: { headline: 'Seu corpo apresenta sinais iniciais de inflamação', description: 'Este é o momento ideal para agir e prevenir o avanço.' },
    moderada: { headline: 'Seu corpo apresenta inflamação moderada', description: 'Os sintomas já afetam sua qualidade de vida.' },
    moderada_avancada: { headline: 'Seu corpo apresenta sinais de inflamação moderada a avançada', description: 'É crucial agir agora para evitar danos irreversíveis.' },
    avancada: { headline: 'Seu corpo apresenta sinais de inflamação avançada', description: 'Atenção urgente: seu corpo precisa de um protocolo específico agora.' },
  },
}

const symptomsMap: Record<string, Record<string, string[]>> = {
  es: {
    leve: ['❌ Tu cuerpo está acumulando inflamación silenciosa', '❌ Edemas esporádicos en piernas y brazos', '❌ Fatiga y pesadez frecuente'],
    moderada: ['❌ Tu cuerpo está acumulando inflamación', '❌ Esto aumenta el edema y la sensación de pesadez', '❌ La grasa no responde a la dieta común'],
    moderada_avancada: ['❌ Tu cuerpo está acumulando inflamación', '❌ La grasa no responde a la dieta común', '❌ Los síntomas tienden a empeorar con el tiempo'],
    avancada: ['❌ Inflamación sistémica avanzada', '❌ Dificultad para caminar y moverse', '❌ Dolores intensos al tacto', '❌ Los síntomas empeoran sin tratamiento específico'],
  },
  pt: {
    leve: ['❌ Seu corpo está acumulando inflamação silenciosa', '❌ Edemas esporádicos nas pernas e braços', '❌ Fadiga e sensação de peso frequente'],
    moderada: ['❌ Seu corpo está acumulando inflamação', '❌ Isso aumenta o inchaço e a sensação de peso', '❌ A gordura não responde à dieta comum'],
    moderada_avancada: ['❌ Seu corpo está acumulando inflamação', '❌ A gordura não responde à dieta comum', '❌ Os sintomas tendem a piorar com o tempo'],
    avancada: ['❌ Inflamação sistêmica avançada', '❌ Dificuldade de locomoção', '❌ Dores intensas ao toque', '❌ Os sintomas pioram sem tratamento específico'],
  },
}

export function ResultScreen({ settings: s, band, bandData, score, quizId }: Props) {
  const rp = s.result_page || {} as Record<string, unknown>
  const result = bandData || (s.results?.[band as keyof typeof s.results]) || {} as BandSettings
  const lang = s.language || 'es'
  const bandColor = result.color || '#426A35'
  const badgeTextColor = result.badge_text_color || '#ffffff'
  const copy = (copyBands[lang] || copyBands.es)[band] || copyBands.es.leve
  const symptoms = (symptomsMap[lang] || symptomsMap.es)[band] || symptomsMap.es.moderada
  const scorePercent = Math.min(95, Math.max(10, (score / 20) * 100))
  const ctaUrl = result.offer_url || s.cta_offer_url || '#'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpp = rp as Record<string, any>

  const compItems = [
    { today: (rpp.comp_item_1_today as string) || (lang === 'pt' ? 'Dores constantes' : 'Dolores constantes'), after: (rpp.comp_item_1_after as string) || (lang === 'pt' ? 'Alívio total da dor' : 'Alivio total del dolor'), todayVal: Math.min(scorePercent + 10, 90) },
    { today: (rpp.comp_item_2_today as string) || (lang === 'pt' ? 'Inchaço e peso' : 'Hinchazón y pesadez'), after: (rpp.comp_item_2_after as string) || (lang === 'pt' ? 'Pernas leves' : 'Piernas ligeras'), todayVal: Math.min(scorePercent + 20, 95) },
    { today: (rpp.comp_item_3_today as string) || (lang === 'pt' ? 'Celulite aparente' : 'Celulitis aparente'), after: (rpp.comp_item_3_after as string) || (lang === 'pt' ? 'Pele mais lisa' : 'Piel más lisa'), todayVal: Math.min(scorePercent + 5, 85) },
    { today: (rpp.comp_item_4_today as string) || (lang === 'pt' ? 'Falta de energia' : 'Falta de energía'), after: (rpp.comp_item_4_after as string) || (lang === 'pt' ? 'Mais disposição' : 'Más disposición'), todayVal: Math.min(scorePercent + 15, 80) },
  ]

  const sectionsOrder = (rp.sections_order as string[]) || ['badge', 'journey', 'comparison', 'diagnosis', 'needs', 'solution', 'how_it_works', 'deliverables', 'benefit', 'pricing', 'social_proof', 'urgency']

  function renderSection(sectionId: string) {
    switch (sectionId) {
      case 'badge':
        return (result.label || band) ? (
          <div key="badge" className="mb-6 text-center">
            {(result.label || band) && (
              <div
                className="mb-4 inline-block rounded-full px-7 py-2.5 text-base font-bold uppercase tracking-wide shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                style={{ background: bandColor, color: badgeTextColor }}
              >
                {result.label || band}
              </div>
            )}
            <div className="rounded-xl border border-yellow-200 bg-orange-50 p-4 text-left" style={{ borderLeft: '4px solid #f97316' }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-yellow-800">
                ⚠️ {lang === 'pt' ? 'SEU RESULTADO baseado nas suas respostas:' : 'TU RESULTADO basado en tus respuestas:'}
              </p>
              <p className="m-0 text-lg font-bold leading-snug text-gray-800">
                {copy.headline} {band === 'avancada' || band === 'moderada_avancada' ? '🔴' : band === 'moderada' ? '🟠' : '🟡'}
              </p>
            </div>
          </div>
        ) : null

      case 'journey':
        return (rpp.journey_title || rpp.journey_days_badge) ? (
          <div key="journey" className="mb-7">
            <div className="mb-3.5 text-center">
              {rpp.journey_title && <h3 className="mb-1.5 text-[19px] font-extrabold text-gray-800">{String(rpp.journey_title)}</h3>}
              {rpp.journey_subtitle && <p className="text-[13px] text-gray-500">{String(rpp.journey_subtitle)}</p>}
            </div>
            <div className="relative">
              {rpp.journey_days_badge && (
                <span className="absolute right-1 top-2 z-10 rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-extrabold text-white">{String(rpp.journey_days_badge)}</span>
              )}
              <svg viewBox="0 0 400 200" className="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`hbqGrad${quizId}`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#ef4444' }} />
                    <stop offset="40%" style={{ stopColor: '#f97316' }} />
                    <stop offset="70%" style={{ stopColor: '#eab308' }} />
                    <stop offset="100%" style={{ stopColor: '#22c55e' }} />
                  </linearGradient>
                </defs>
                {[20, 57, 94, 131].map((y) => <line key={y} x1="45" y1={y} x2="390" y2={y} stroke="#f1f5f9" strokeWidth="1" />)}
                <line x1="45" y1="168" x2="390" y2="168" stroke="#e2e8f0" strokeWidth="1" />
                {[{ y: 172, t: '0' }, { y: 135, t: '25' }, { y: 98, t: '50' }, { y: 61, t: '75' }, { y: 24, t: '100' }].map((l) => (
                  <text key={l.y} x="38" y={l.y} textAnchor="end" fontSize="10" fill="#94a3b8">{l.t}</text>
                ))}
                <polygon points="48,168 390,168 390,20" fill={`url(#hbqGrad${quizId})`} opacity="0.88" />
                <circle cx="48" cy="168" r="7" fill="#ef4444" stroke="#fff" strokeWidth="2.5" />
                <circle cx="390" cy="20" r="7" fill="#22c55e" stroke="#fff" strokeWidth="2.5" />
                {rpp.journey_label_today && <text x="62" y="185" fontSize="10" fontWeight="700" fill="#ef4444">{String(rpp.journey_label_today)}</text>}
                {rpp.journey_label_future && <text x="388" y="14" fontSize="10" fontWeight="700" fill="#22c55e" textAnchor="end">{String(rpp.journey_label_future)}</text>}
              </svg>
            </div>
          </div>
        ) : null

      case 'comparison':
        return (rpp.comp_today_title || rpp.comp_after_title) ? (
          <div key="comparison" className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                <div className="mb-3 text-center">
                  <span className="mb-1.5 block text-[28px]">{String(rpp.comp_today_icon || '⏰')}</span>
                  <span className="text-xs font-extrabold uppercase text-gray-600">{String(rpp.comp_today_title || '')}</span>
                </div>
                {compItems.map((item, i) => item.today && (
                  <div key={i} className="mb-2.5">
                    <div className="mb-0.5 flex justify-between text-[11px] font-bold text-gray-800">
                      <span>{item.today}</span>
                      <span className="text-gray-400">{Math.round(item.todayVal)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-gray-100">
                      <div className="h-full rounded bg-red-500" style={{ width: `${item.todayVal}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                <div className="mb-3 text-center">
                  <span className="mb-1.5 block text-[28px]">{String(rpp.comp_after_icon || '✨')}</span>
                  <span className="text-xs font-extrabold uppercase text-gray-600">{String(rpp.comp_after_title || '')}</span>
                </div>
                {compItems.map((item, i) => item.after && (
                  <div key={i} className="mb-2.5">
                    <div className="mb-0.5 flex justify-between text-[11px] font-bold text-gray-800">
                      <span>{item.after}</span>
                      <span className="text-gray-400">100%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-gray-100">
                      <div className="h-full rounded bg-gradient-to-r from-green-500 to-[#5a9e42]" style={{ width: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null

      case 'diagnosis':
        return (
          <div key="diagnosis">
            {(rpp.diagnosis_heading || symptoms.length > 0) && (
              <div className="mb-5 rounded-[14px] border border-green-100 bg-green-50 p-5">
                {rpp.diagnosis_heading && <p className="mb-3 text-base font-bold text-green-800">{String(rpp.diagnosis_heading)}</p>}
                {symptoms.length > 0 && (
                  <ul className="m-0 list-none p-0">
                    {symptoms.map((sym, i) => (
                      <li key={i} className="mb-1.5 rounded-lg border-l-[3px] border-emerald-500 bg-emerald-50/50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
                        {sym}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {rpp.goodnews_text && (
              <div className="mb-5 rounded-[14px] border border-green-200 bg-gradient-to-br from-[#f0f7ed] to-[#e8f5e3] px-5 py-[18px]">
                <p className="m-0 text-[15px] leading-relaxed text-[#2d5a1e]">{String(rpp.goodnews_text)}</p>
              </div>
            )}
          </div>
        )

      case 'needs':
        return (rpp.needs_title || rpp.needs_desc || rpp.needs_cta) ? (
          <div key="needs" className="mb-5 rounded-[14px] border border-green-200 bg-green-50 p-5">
            {rpp.needs_title && <h3 className="mb-2.5 text-base font-extrabold text-green-900">{String(rpp.needs_title)}</h3>}
            {rpp.needs_desc && <p className="mb-1.5 text-[15px] leading-relaxed text-green-800">{String(rpp.needs_desc)}</p>}
            {rpp.needs_cta && <p className="m-0 text-base font-bold text-green-700">{String(rpp.needs_cta)}</p>}
          </div>
        ) : null

      case 'solution': {
        const solItems = Array.isArray(rpp.solution_items) ? (rpp.solution_items as string[]).filter(Boolean) : []
        return (rpp.solution_title || rpp.solution_desc) ? (
          <div key="solution" className="relative mb-6 overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-[#f0f6ee] to-[#e8f0e5] px-6 py-7">
            {rpp.solution_badge && (
              <div className="mb-3.5 inline-block rounded-full bg-gradient-to-br from-red-500 to-red-600 px-3.5 py-1.5 text-xs font-extrabold uppercase text-white">{String(rpp.solution_badge)}</div>
            )}
            {rpp.solution_title && <h3 className="mb-3 text-[22px] font-extrabold text-gray-700">{String(rpp.solution_title)}</h3>}
            {rpp.solution_desc && <div className="mb-4 text-[15px] leading-relaxed text-gray-600">{String(rpp.solution_desc)}</div>}
            {solItems.length > 0 && (
              <ul className="my-4 list-none p-0">
                {solItems.map((item, i) => (
                  <li key={i} className="mb-2.5 rounded-lg bg-[rgba(66,106,53,0.08)] px-3.5 py-2.5 text-[15px] font-medium text-gray-700">{item}</li>
                ))}
              </ul>
            )}
          </div>
        ) : null
      }

      case 'how_it_works':
        return (rpp.step_1_title || rpp.step_2_title) ? (
          <div key="how_it_works" className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-6">
            <h3 className="mb-4 text-[15px] font-extrabold text-gray-800">
              🪜 {lang === 'pt' ? 'COMO FUNCIONA' : 'CÓMO FUNCIONA'}
            </h3>
            {rpp.step_1_title && (
              <div className="mb-3 flex items-start gap-3">
                <span className="shrink-0 text-[28px]">{String(rpp.step_1_icon || '🥗')}</span>
                <div>
                  <strong className="mb-1 block text-[15px] font-bold text-gray-800">{String(rpp.step_1_title)}</strong>
                  <p className="m-0 text-sm leading-snug text-gray-500">{String(rpp.step_1_text || '')}</p>
                </div>
              </div>
            )}
            {rpp.step_2_title && (
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-[28px]">{String(rpp.step_2_icon || '🔥')}</span>
                <div>
                  <strong className="mb-1 block text-[15px] font-bold text-gray-800">{String(rpp.step_2_title)}</strong>
                  <p className="m-0 text-sm leading-snug text-gray-500">{String(rpp.step_2_text || '')}</p>
                </div>
              </div>
            )}
          </div>
        ) : null

      case 'deliverables': {
        const deliverables = Array.isArray(rpp.deliverables) ? (rpp.deliverables as string[]).filter(Boolean) : []
        return (deliverables.length > 0 || rpp.deliverables_title) ? (
          <div key="deliverables" className="mb-5 rounded-2xl border border-green-200 bg-gradient-to-br from-[#f0f6ee] to-[#e8f0e5] p-5">
            {rpp.deliverables_title && <h3 className="mb-3.5 text-base font-extrabold text-green-900">{String(rpp.deliverables_title)}</h3>}
            {deliverables.length > 0 && (
              <ul className="m-0 list-none p-0">
                {deliverables.map((d, i) => (
                  <li key={i} className="border-b border-[rgba(66,106,53,0.15)] py-2.5 text-[15px] font-semibold text-green-800">✔ {d}</li>
                ))}
              </ul>
            )}
          </div>
        ) : null
      }

      case 'benefit':
        return rpp.benefit_text ? (
          <div key="benefit" className="mb-5 rounded-[14px] border border-yellow-200 bg-amber-50 px-[18px] py-4 text-center">
            {rpp.benefit_badge_label && (
              <span className="mb-2.5 inline-block rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold uppercase text-white">{String(rpp.benefit_badge_label)}</span>
            )}
            <p className="m-0 text-[15px] font-semibold text-yellow-800">{String(rpp.benefit_text)}</p>
          </div>
        ) : null

      case 'pricing': {
        const pricingFeatures = Array.isArray(rpp.pricing_features) ? (rpp.pricing_features as string[]).filter(Boolean) : []
        return (rpp.price_to || rpp.cta_text) ? (
          <div key="pricing" className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex">
              {pricingFeatures.length > 0 && (
                <div className="flex-1 bg-[#f0f6ee] p-5">
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {pricingFeatures.map((f, i) => (
                      <li key={i} className="text-[13px] font-semibold text-green-800">✔ {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex-1 p-5 text-center">
                {rpp.offer_label && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{String(rpp.offer_label)}</p>}
                {rpp.price_from && <p className="mb-1 text-sm text-gray-400">DE <span className="line-through">{String(rpp.price_from)}</span></p>}
                {rpp.offer_sublabel && <p className="mb-1 text-sm font-semibold text-gray-600">{String(rpp.offer_sublabel)}</p>}
                {rpp.price_to && (
                  <div className="mb-4 flex items-end justify-center gap-1 leading-none">
                    <span className="text-[56px] font-black leading-none text-gray-800">{String(rpp.price_to)}</span>
                    <span className="mb-2 text-lg font-bold text-gray-500">{String(rpp.price_currency || '')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 text-center">
              {rpp.cta_text && (
                <a
                  href={ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 block rounded-xl bg-[#426A35] px-5 py-5 text-lg font-extrabold text-white no-underline shadow-[0_6px_20px_rgba(66,106,53,0.3)]"
                >
                  {String(rpp.cta_text)}
                </a>
              )}
              {rpp.guarantee_text && <p className="mb-1 text-[13px] text-gray-500">{String(rpp.guarantee_text)}</p>}
              {rpp.offer_footer_1 && <p className="mb-0.5 text-xs text-gray-400">{String(rpp.offer_footer_1)}</p>}
              {rpp.offer_footer_2 && <p className="m-0 text-xs text-gray-400">{String(rpp.offer_footer_2)}</p>}
            </div>
          </div>
        ) : null
      }

      case 'social_proof': {
        if (!rpp.show_social_proof || !rpp.gallery_ids) return null
        const galleryUrls = String(rpp.gallery_ids).split(',').map((u: string) => u.trim()).filter(Boolean)
        return galleryUrls.length > 0 ? (
          <div key="social_proof" className="mb-6 text-center">
            {rpp.social_proof_title && <p className="mb-1 text-[17px] font-bold">{String(rpp.social_proof_title)}</p>}
            {rpp.social_proof_subtitle && <p className="mb-3 text-sm font-semibold text-[#4a6d41]">{String(rpp.social_proof_subtitle)}</p>}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryUrls.map((url: string, i: number) => (
                <img key={i} src={url} alt="" loading="lazy" className="h-[200px] min-w-[280px] rounded-xl object-cover" />
              ))}
            </div>
          </div>
        ) : null
      }

      case 'urgency':
        return rpp.urgency_text ? (
          <div key="urgency" className="mb-5 rounded-2xl border border-yellow-400 bg-yellow-50 p-5 text-center">
            <p className="m-0 text-[15px] text-yellow-700">{String(rpp.urgency_text)}</p>
          </div>
        ) : null

      default:
        return null
    }
  }

  if (rpp.type === 'manual') {
    return <div dangerouslySetInnerHTML={{ __html: String(rpp.manual_html || '<p>Conteúdo não configurado.</p>') }} />
  }

  return (
    <div className="mx-auto max-w-[708px] rounded-xl bg-white p-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {result.image_url && (
        <img
          src={result.image_url}
          alt=""
          loading="lazy"
          className="mx-auto mb-6 block h-80 w-full max-w-[708px] rounded-xl object-cover shadow-[0_10px_25px_rgba(0,0,0,0.1)]"
        />
      )}
      {sectionsOrder.map((sectionId) => renderSection(sectionId))}
    </div>
  )
}
