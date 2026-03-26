'use client'
import type { QuizSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onChange: (s: QuizSettings) => void
}

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

export function Step5ResultPage({ settings, onChange }: Props) {
  const rp = (settings.result_page ?? {}) as Record<string, unknown>

  function setRp(key: string) {
    return (val: unknown) => onChange({ ...settings, result_page: { ...rp, [key]: val } })
  }

  function textInput(label: string, key: string, placeholder?: string) {
    return (
      <Field label={label}>
        <input className={inp} value={(rp[key] as string) ?? ''} onChange={(e) => setRp(key)(e.target.value)} placeholder={placeholder} />
      </Field>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-800">5. Página de Resultado</h2>

      <Field label="Tipo da página de resultado">
        <select className={inp} value={(rp.type as string) ?? 'standard'} onChange={(e) => setRp('type')(e.target.value)}>
          <option value="standard">Padrão</option>
          <option value="manual">HTML Manual</option>
        </select>
      </Field>

      {rp.type === 'manual' ? (
        <Field label="HTML Manual">
          <textarea className={inp} rows={8} value={(rp.manual_html as string) ?? ''} onChange={(e) => setRp('manual_html')(e.target.value)} placeholder="<div>...</div>" />
        </Field>
      ) : (
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-700">Badge e Diagnóstico</h3>
            {textInput('Label do badge de resultado', 'result_badge_label', 'Seu Diagnóstico')}
            {textInput('Título do diagnóstico', 'diagnosis_heading')}
            {textInput('Texto "Boa notícia"', 'goodnews_text')}
          </section>

          <section className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-700">Jornada (hoje → futuro)</h3>
            {textInput('Título da jornada', 'journey_title')}
            {textInput('Subtítulo', 'journey_subtitle')}
            {textInput('Label Hoje', 'journey_label_today', 'Hoje')}
            {textInput('Label Futuro', 'journey_label_future', 'Em breve')}
            {textInput('Badge de dias', 'journey_days_badge', '30 dias')}
          </section>

          <section className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-700">Comparativo (4 itens)</h3>
            {textInput('Título coluna Hoje', 'comp_today_title')}
            {textInput('Título coluna Depois', 'comp_after_title')}
            {[1, 2, 3, 4].flatMap((i) => [
              textInput(`Item ${i} — Hoje`, `comp_item_${i}_today`),
              textInput(`Item ${i} — Depois`, `comp_item_${i}_after`),
            ])}
          </section>

          <section className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-700">Solução</h3>
            {textInput('Badge da solução', 'solution_badge')}
            {textInput('Título', 'solution_title')}
            <Field label="Descrição">
              <textarea className={inp} rows={3} value={(rp.solution_desc as string) ?? ''} onChange={(e) => setRp('solution_desc')(e.target.value)} />
            </Field>
          </section>

          <section className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-700">Oferta / Pricing</h3>
            {textInput('Label da oferta', 'offer_label')}
            {textInput('Sub-label', 'offer_sublabel')}
            {textInput('Preço DE', 'price_from')}
            {textInput('Preço POR', 'price_to')}
            {textInput('Moeda', 'price_currency', 'R$')}
            {textInput('Texto do CTA', 'cta_text', 'Quero agora!')}
            {textInput('Garantia', 'guarantee_text')}
            {textInput('Urgência final', 'urgency_text')}
          </section>
        </div>
      )}
    </div>
  )
}
