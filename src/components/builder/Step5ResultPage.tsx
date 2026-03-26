'use client'
import { Toggle } from '@/components/ui/Toggle'
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {children}
    </section>
  )
}

export function Step5ResultPage({ settings, onChange }: Props) {
  const rp = (settings.result_page ?? {}) as Record<string, unknown>

  function setRp(key: string) {
    return (val: unknown) => onChange({ ...settings, result_page: { ...rp, [key]: val } })
  }

  function text(label: string, key: string, placeholder?: string) {
    return (
      <Field label={label}>
        <input className={inp} value={(rp[key] as string) ?? ''} onChange={(e) => setRp(key)(e.target.value)} placeholder={placeholder} />
      </Field>
    )
  }

  function textarea(label: string, key: string, rows = 3) {
    return (
      <Field label={label}>
        <textarea className={inp} rows={rows} value={(rp[key] as string) ?? ''} onChange={(e) => setRp(key)(e.target.value)} />
      </Field>
    )
  }

  function listField(label: string, key: string, count: number, placeholder?: string) {
    const arr = Array.isArray(rp[key]) ? (rp[key] as string[]) : Array(count).fill('')
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {arr.map((val: string, i: number) => (
          <input key={i} className={inp} value={val ?? ''} placeholder={placeholder ? `${placeholder} ${i + 1}` : ''} onChange={(e) => {
            const next = [...arr]
            next[i] = e.target.value
            setRp(key)(next)
          }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-800">5. Página de Resultado</h2>

      <Field label="Tipo da página">
        <select className={inp} value={(rp.type as string) ?? 'standard'} onChange={(e) => setRp('type')(e.target.value)}>
          <option value="standard">Padrão (template)</option>
          <option value="manual">HTML Manual</option>
        </select>
      </Field>

      {rp.type === 'manual' ? (
        textarea('HTML Manual', 'manual_html', 10)
      ) : (
        <div className="space-y-6">

          <Section title="🏷️ Badge de resultado">
            {text('Label do badge', 'result_badge_label', '⚠️ TU RESULTADO basado en tus respuestas:')}
          </Section>

          <Section title="📈 Jornada (Journey Chart)">
            {text('Título', 'journey_title', 'Tu Jornada en los Próximos 30 Días')}
            {text('Subtítulo', 'journey_subtitle')}
            {text('Label Hoje', 'journey_label_today', 'HOY')}
            {text('Label Futuro', 'journey_label_future', 'EN 30 DÍAS')}
            {text('Badge de dias', 'journey_days_badge', '30 DÍAS')}
          </Section>

          <Section title="📊 Comparativo (hoje vs depois)">
            <div className="grid grid-cols-2 gap-3">
              {text('Ícone coluna Hoje', 'comp_today_icon')}
              {text('Ícone coluna Depois', 'comp_after_icon')}
              {text('Título coluna Hoje', 'comp_today_title')}
              {text('Título coluna Depois', 'comp_after_title')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">Item {i}</p>
                  <input className={inp} placeholder="Hoje" value={(rp[`comp_item_${i}_today`] as string) ?? ''} onChange={(e) => setRp(`comp_item_${i}_today`)(e.target.value)} />
                  <input className={inp} placeholder="Depois" value={(rp[`comp_item_${i}_after`] as string) ?? ''} onChange={(e) => setRp(`comp_item_${i}_after`)(e.target.value)} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="🩺 Diagnóstico">
            {text('Heading do diagnóstico', 'diagnosis_heading', '⚠️ Lo que esto significa en la prática:')}
            {textarea('Texto boa notícia', 'goodnews_text')}
          </Section>

          <Section title="🎯 O que seu corpo precisa">
            {text('Título', 'needs_title')}
            {text('Descrição', 'needs_desc')}
            {text('CTA', 'needs_cta')}
          </Section>

          <Section title="💊 Solução">
            {text('Badge da solução', 'solution_badge')}
            {text('Título', 'solution_title')}
            {textarea('Descrição', 'solution_desc')}
            {listField('Itens da solução (até 4)', 'solution_items', 4, 'Item')}
          </Section>

          <Section title="🪜 Como funciona">
            <div className="grid grid-cols-2 gap-3">
              {text('Ícone passo 1', 'step_1_icon')}
              {text('Ícone passo 2', 'step_2_icon')}
            </div>
            {text('Título passo 1', 'step_1_title')}
            {text('Texto passo 1', 'step_1_text')}
            {text('Título passo 2', 'step_2_title')}
            {text('Texto passo 2', 'step_2_text')}
          </Section>

          <Section title="🎁 Entregáveis">
            {text('Título', 'deliverables_title')}
            {listField('Entregáveis (até 6)', 'deliverables', 6, 'Entregável')}
          </Section>

          <Section title="⚡ Benefício imediato">
            {text('Badge', 'benefit_badge_label')}
            {text('Texto', 'benefit_text')}
          </Section>

          <Section title="💰 Oferta / Pricing">
            {text('Label oferta', 'offer_label')}
            {text('Sub-label', 'offer_sublabel')}
            {listField('Features do pricing (até 3)', 'pricing_features', 3, 'Feature')}
            <div className="grid grid-cols-3 gap-3">
              {text('Preço DE', 'price_from')}
              {text('Preço POR', 'price_to')}
              {text('Moeda', 'price_currency')}
            </div>
            {text('Texto do CTA', 'cta_text')}
            {text('Garantia', 'guarantee_text')}
            {text('Rodapé 1', 'offer_footer_1')}
            {text('Rodapé 2', 'offer_footer_2')}
          </Section>

          <Section title="📸 Prova Social">
            <Field label="Exibir prova social">
              <Toggle
                checked={Boolean(rp.show_social_proof)}
                onChange={(v) => setRp('show_social_proof')(v)}
              />
            </Field>
            {Boolean(rp.show_social_proof) && (
              <>
                {text('Título', 'social_proof_title')}
                {text('Subtítulo', 'social_proof_subtitle')}
                <Field label="URLs das imagens (separadas por vírgula)">
                  <textarea
                    className={inp}
                    rows={3}
                    placeholder="https://exemplo.com/foto1.jpg, https://exemplo.com/foto2.jpg"
                    value={(rp.gallery_ids as string) ?? ''}
                    onChange={(e) => setRp('gallery_ids')(e.target.value)}
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="⚠️ Urgência final">
            {textarea('Texto de urgência', 'urgency_text')}
          </Section>

        </div>
      )}
    </div>
  )
}
