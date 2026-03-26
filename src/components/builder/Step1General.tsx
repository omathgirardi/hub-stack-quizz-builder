'use client'
import { TiptapEditor } from './TiptapEditor'
import { ImageUploader } from './ImageUploader'
import type { QuizSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onChange: (s: QuizSettings) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const inp = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function Step1General({ settings, onChange }: Props) {
  const set = (key: keyof QuizSettings) => (val: string) => onChange({ ...settings, [key]: val })

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-800">1. Configurações Gerais</h2>

      <Field label="Headline (rich text)">
        <TiptapEditor value={settings.headline ?? ''} onChange={set('headline')} placeholder="Ex: Descubra seu nível..." />
      </Field>

      <Field label="Subheadline (rich text)">
        <TiptapEditor value={settings.subheadline ?? ''} onChange={set('subheadline')} placeholder="Subtítulo do quiz..." />
      </Field>

      <Field label="Texto do botão CTA">
        <input className={inp} value={settings.cta_button ?? ''} onChange={(e) => set('cta_button')(e.target.value)} placeholder="Iniciar Quiz" />
      </Field>

      <Field label="Badge text">
        <input className={inp} value={settings.badge_text ?? ''} onChange={(e) => set('badge_text')(e.target.value)} />
      </Field>

      <ImageUploader label="Imagem da landing page" value={settings.landing_image ?? ''} onChange={set('landing_image')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(['checklist_item_1', 'checklist_item_2', 'checklist_item_3'] as const).map((key, i) => (
          <Field key={key} label={`Checklist ${i + 1}`}>
            <input className={inp} value={settings[key] ?? ''} onChange={(e) => set(key)(e.target.value)} />
          </Field>
        ))}
      </div>

      <Field label="Texto de urgência">
        <input className={inp} value={settings.urgency_text ?? ''} onChange={(e) => set('urgency_text')(e.target.value)} />
      </Field>

      <Field label="URL da oferta global (CTA final)">
        <input className={inp} type="url" value={settings.cta_offer_url ?? ''} onChange={(e) => set('cta_offer_url')(e.target.value)} />
      </Field>

      <Field label="Webhook URL (disparado ao concluir resposta)">
        <input className={inp} type="url" value={settings.webhook_url ?? ''} onChange={(e) => set('webhook_url')(e.target.value)} placeholder="https://..." />
      </Field>

      <Field label="Idioma">
        <select
          className={inp}
          value={settings.language ?? 'pt'}
          onChange={(e) => onChange({ ...settings, language: e.target.value as 'pt' | 'es' })}
        >
          <option value="pt">Português</option>
          <option value="es">Español</option>
        </select>
      </Field>
    </div>
  )
}
